//mqtt相关
const char *mqtt_server = "192.168.75.186";
const char *mqtt_username = "admin";
const char *mqtt_password = "fjh030303";

float temperature, humidity;

void callback(char* topic, byte* payload, unsigned int length) {
  DynamicJsonDocument doc(1024);
  deserializeJson(doc, payload);
  JsonObject jsonObj = doc.as<JsonObject>();
  JsonObject params = jsonObj["params"];
  if(params["WaterOutletSwitch"] == 0) {
    Serial.println("LED-OFF");
    digitalWrite(D8, LOW);
  }
  if(params["WaterOutletSwitch"] == 1) {
    Serial.println("LED-ON");
    digitalWrite(D8, HIGH);
  }
   Serial.print("Message arrived [");
   Serial.print(topic);
   Serial.print("] ");
}

void sendpindata() {
  DynamicJsonDocument doc(1024);

  for (uint8_t i = 0; i < 8; i++) {
    doc["d" + String(i + 1)] = pin_data.d[i];
  }
  
  char json_string[256];
  serializeJson(doc, json_string);
  client.publish(p1_topic, json_string);
}

void sendSensorMessage() {
  DynamicJsonDocument data(256);
  humidity = std::fmin(std::fmax(30, humidity), 80);
  data["temperature"] = (int)(temperature * 10) / 10.0;
  data["humidity"] = (int)humidity;
  data["soilHum"] = 45.2;
  char json_string[256];
  serializeJson(data,json_string);
  Serial.println(json_string);
  //发布数据
  client.publish(p_topic, json_string);
}

//连接mq服务
void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Create a random client ID
    String clientId = "ESP8266Client-";
    clientId += String(random(0xffff), HEX);
    // Attempt to connect
    if (client.connect(clientId.c_str(), mqtt_username, mqtt_password)) {
      Serial.println("connected s_topic");
      // Once connected, publish an announcement...
      client.publish(p_topic, "hello world");
      // ... and resubscribe
      client.subscribe(s_topic);
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}

void mqtt_setup() {
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);
  client.subscribe(s_topic);
}

void mqtt_loop() {
  delay(2000);
  if(!client.connected()) {
    reconnect();
  }
  sendpindata();
  sendSensorMessage();
  client.loop();
}