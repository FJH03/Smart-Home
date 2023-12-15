//ota空中升级模块
#include <ESP8266httpUpdate.h>

String upUrl = "http://bin.bemfa.com/b/3BcNDQ5OTMwYTY1Y2RlNGUyNDk1MjI1YTg4M2I3Y2Y2ZWY=8266.bin";//bin文件的服务器路径

//当升级开始时，打印日志
void update_started() {
  Serial.println("CALLBACK:  HTTP update process started");
}

//当升级结束时，打印日志
void update_finished() {
  Serial.println("CALLBACK:  HTTP update process finished");
}

//当升级中，打印日志
void update_progress(int cur, int total) {
  Serial.printf("CALLBACK:  HTTP update process at %d of %d bytes...\n", cur, total);
}

//当升级失败时，打印日志
void update_error(int err) {
  Serial.printf("CALLBACK:  HTTP update fatal error code %d\n", err);
}

/**
 * 固件升级函数
 * 在需要升级的地方，加上这个函数即可，例如setup中加的updateBin(); 
 * 原理：通过http请求获取远程固件，实现升级
 */
void updateBin() {
  Serial.println("start update");    
  WiFiClient UpdateClient;

  ESPhttpUpdate.onStart(update_started);//当升级开始时
  ESPhttpUpdate.onEnd(update_finished); //当升级结束时
  ESPhttpUpdate.onProgress(update_progress); //当升级中
  ESPhttpUpdate.onError(update_error); //当升级失败时

  t_httpUpdate_return ret = ESPhttpUpdate.update(UpdateClient, upUrl);
  switch(ret) {
    case HTTP_UPDATE_FAILED:      //当升级失败
        Serial.println("[update] Update failed.");
        break;
    case HTTP_UPDATE_NO_UPDATES:  //当无升级
        Serial.println("[update] Update no Update.");
        break;
    case HTTP_UPDATE_OK:         //当升级成功
        Serial.println("[update] Update ok.");
        break;
  }
}
