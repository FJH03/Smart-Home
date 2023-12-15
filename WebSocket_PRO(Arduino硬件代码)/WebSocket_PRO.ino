#include <ESP8266WiFi.h>
#include <PubSubClient.h>

#include "AsyncJson.h"
#include "ArduinoJson.h"

const char* ssid = "FJH_03";//wifi名称
const char* password = "135792468";//wifi密码

WiFiClient espClient;
PubSubClient client(espClient);
const char *s_topic = "v1/devices/me/rpc/hardware";
const char *s1_topic = "v1/devices/me/rpc/esp8266";
const char *p_topic = "v1/devices/telemetry";
const char *p1_topic = "pindata";

/**
   用一个struct 保存引脚的数据，检测到任何一个引脚发生变化，则将整个struct 发送给客户端
*/

struct PINDATA {
  uint8_t dname[8] = {D1, D2, D3, D4, D5, D6, D7, D8};
  uint8_t d[8] = {0, 0, 0, 0, 0, 0, 0, 0};
  //上一次触发时间
  unsigned long dt[8] = {0, 0, 0, 0, 0, 0, 0, 0};
} pin_data;

int flag, pos;

#include "rs.h"//防误触重启模块
//#include "ota.h"//远程升级模块
#include "mqtt.h"//mqtt连接模块
#include "Sensor.h"//传感器监测模块


void setup() {
  Serial.begin(9600);

  //设置默认的电平
  pinMode(LED_BUILTIN, OUTPUT);
  for (uint8_t i = 0; i < 8; i++) {
    if (pin_data.dname[i] == D3) {
      pinMode(pin_data.dname[i], INPUT_PULLUP);
    }else if (pin_data.dname[i] == D2 || pin_data.dname[i] == D4) {
      pinMode(pin_data.dname[i], OUTPUT);
      digitalWrite(D4, HIGH);
    }else {
      //pinMode(pin_data.dname[i], INPUT);//工作模式
      pinMode(pin_data.dname[i], OUTPUT);//测试模式
    }
  }

  //连接wifi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(2000);
    Serial.println("Connecting to WiFi..");
  }
  Serial.println(WiFi.localIP());
  
  //启动mqtt
  mqtt_setup();

  Sensor_open();
}

void loop() {
  unsigned long currenttime = millis();
  //检查引脚的状态
  bool is_changed = false;
  for (int8 i = 0; i < 8; i++) {
    int8_t tmp = digitalRead(pin_data.dname[i]);
    if (pin_data.d[i] != tmp) {
    //防止误触发(<50毫秒的信号将忽略)
     if (currenttime - pin_data.dt[i] > 50) {
       pin_data.dt[i] = currenttime;
       is_changed = true;
       pin_data.d[i] = tmp;
     }
    }
  }

  mqtt_loop();//mqtt服务
  RstWork();//实时监测防误触重启
  Sensor_loop();//传感器检测模块
  
  //如果引脚数据发生变化，就发送给所有客户端
  if (is_changed) {
    Serial.println("is changed");
  }
}
