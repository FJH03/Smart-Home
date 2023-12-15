//重启模块,位于loop循环内执行
//由D3间接控制D4->RST(防误触发机制,作用于D3,大于等于4s生效)
int8_t lastButtonState = LOW;
int8_t pinState = HIGH;
int8_t buttonState;

void RstWork() {
  int8_t reading = digitalRead(D3);

  if (reading != lastButtonState) {
    pin_data.dt[3] = millis();
  }

  if (millis() - pin_data.dt[3] >= 4000) {
    if(reading != buttonState) {
      buttonState = reading;
    }
    if (buttonState == LOW) {
      pinState = !pinState;
    }
  }
  
  digitalWrite(pin_data.dname[3], pinState);

  if (digitalRead(D4) == LOW) {
    ESP.restart();
  }

  lastButtonState = reading;
}
