import axios from "axios";

const api = axios.create({
  baseURL:"https://verita-brgchubha6ceathm.brazilsouth-01.azurewebsites.net/",
  headers: {
    'X-API-KEY': '2NtzCUDl8Ib2arnDRck0xK8taguGeFYuZqnUzpiZ9Wp-tUZ45--/i=tKxzwTPBvtykMSx!0t?7c/Z?NllkokY=TEC2DSonmOMUu0gxdCeh70/rA2NSsm7Ohjn7VM2BeP'
  }
});

export default api;
