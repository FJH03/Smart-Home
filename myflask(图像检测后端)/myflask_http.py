# @Date: 2023/9/21
# @Time: 21:46
# Author: 2113042621-冯佳和
# @File: myflask_http

import base64
import io

import cv2
import numpy as np
from PIL import Image
from flask import Flask, request, jsonify, Response, render_template
from gevent import pywsgi
from ultralytics import YOLO
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# 定义模型文件路径
model_paths = {
    'yolov8n.pt': './MyModel/yolov8n.pt',
    'yolov8n-seg.pt': './MyModel/yolov8n-seg.pt',
    'yolov8n-pose.pt': './MyModel/yolov8n-pose.pt',
    'fire_prev.pt': './MyModel/fire_prev.pt',#自训练模型：火灾检测
    'refuse-classification.pt': './MyModel/refuse-classification.pt',#自训练模型：垃圾分类
    'face_mask.pt': './MyModel/face_mask.pt'#自训练模型：口罩佩戴检测
}
#建立服务器所需的本地ip或公网ip
my_flask_ip = '10.128.183.177'

# 加载默认模型
default_model = YOLO(model_paths['yolov8n.pt'])

@app.route('/')
def index():
    return render_template('index.html', text= "检测结果")

@app.route('/change-model', methods=['POST'])
def change_model():
    try:
        if request.method != "POST":
            return jsonify({"code": 2, "msg": "the request method is error!", "data": {"isSecret": "null"}})

        model_name = request.json.get('model')

        if model_name not in model_paths:
            return jsonify({"code": 3, "msg": "invalid model name!", "data": {"isSecret": "null"}})

        model_path = model_paths[model_name]

        # 加载模型
        model = YOLO(model_path)

        # 将新的模型设置为默认模型
        global default_model
        default_model = model

        return jsonify({"code": 0, "msg": "model changed successfully"})
    except Exception as e:
        return jsonify({"code": 1, "msg": "an error occurred!", "data": {"isSecret": "null", "error": str(e)}})


@app.route('/detected', methods=['POST'])
def detected():
    try:
        if request.method != "POST":
            return jsonify({"code": 2, "msg": "the request method is error!", "data": {"isSecret": "null"}})

        if request.files.get("image"):
            # 将读取的图片流转换为图片格式
            im_file = request.files["image"]
            im_bytes = im_file.read()
            im = Image.open(io.BytesIO(im_bytes))

            # 加载模型，将图片输入到模型中，输出的结果是一个list，带有坐标类别等信息
            results = default_model(im)  # reduce size=320 for faster inference

            #绘制框图
            for r in results:
                im_array = r.plot()  # plot a BGR numpy array of predictions
                im = Image.fromarray(im_array[..., ::-1])  # RGB PIL image

            # 将图像转换为 base64 编码的字符串
            _, im_encoded = cv2.imencode(".jpg", cv2.cvtColor(np.array(im), cv2.COLOR_RGB2BGR))
            img_res = base64.b64encode(im_encoded).decode('utf-8')

            #预测文字结果处理
            objectdata = []
            numofobject = {}

            for r in results:
                for i in r.boxes.cls.tolist():
                    objectdata.append(r.names[i])

            for k in objectdata:
                if k in numofobject:
                    numofobject[k] += 1
                else:
                    numofobject[k] = 1

            detection = {
                'num': numofobject
            }

            return jsonify({"data": {"detect_res": "yes", "image": img_res, "Result": detection}})
        else:
            return jsonify({"code": 3, "msg": "no image file provided!", "data": {"isSecret": "null"}})
    except Exception as e:
        return jsonify({"code": 1, "msg": "an error occurred!", "data": {"isSecret": "null", "error": str(e)}})

def generate_frames():
    video_capture = cv2.VideoCapture(0)
    #video_capture = cv2.VideoCapture(1, cv2.CAP_DSHOW)
    while True:
        success, frame = video_capture.read()
        if not success:
            continue

        frame = cv2.transpose(frame)
        frame = cv2.flip(frame, 1)

        res = default_model(frame)

        # 预测文字结果处理
        objectdata = []
        numofobject = {}

        for r in res:
            for i in r.boxes.cls.tolist():
                objectdata.append(r.names[i])

        for k in objectdata:
            if k in numofobject:
                numofobject[k] += 1
            else:
                numofobject[k] = 1

        ann = res[0].plot()
        count = 0
        line_height = 30  # 每个物品和数量之间的行高

        for key, value in numofobject.items():
            text = "Item: " + key + "   Amount: " + str(value)
            org = (20, count * line_height + 50)
            cv2.putText(ann, text, org, cv2.FONT_HERSHEY_SIMPLEX, 1.0, (255, 255, 0), 2)
            count += 1

        ret, buffer = cv2.imencode('.jpg', ann)
        if not ret:
            continue

        flv_frame = buffer.tobytes()

        # 返回帧和 detection_json
        yield (b'--frame\r\n'b'Content-Type: video/jpeg\r\n\r\n' + flv_frame + b'\r\n\r\n')

@app.route('/video_feed', methods=['GET'])
def video_feed():
    response = Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')
    return response

if __name__ == '__main__':
    server = pywsgi.WSGIServer((my_flask_ip, 5000), app)
    server.serve_forever()