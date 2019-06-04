
class attribute {
  constructor(plc_address, type) {
      this.last_update = 0;
      this.update_intervall = 0;

      this.plc_address = plc_address;

      this.publish_to_mqtt = true;
      this.read_from_s7 = true;

      this.type = type;
  }


  rec_s7_data(data) {

  }

  rec_mqtt_data(data) {

  }


}
