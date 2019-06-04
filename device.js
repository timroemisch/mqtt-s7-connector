
class device {
  constructor(plc, mqtt, config) {
    this.plc_handler = plc;
    this.mqtt_handler = mqtt;

    this.name = config.name;
    this.config = config;

    this.attributes = [];
    this.mqtt_base = "";
  }


  send_discover_msg() {

  }

  rec_s7_data(data) {

  }

  rec_mqtt_data(data) {

  }

}
