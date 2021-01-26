import {NowRequest, NowResponse} from '@vercel/node';
import Wyze from 'wyze-node';

const deviceTypes = ['Plug', 'Light'];
const devicePrefix = 'zoom_';

export default async (request: NowRequest, response: NowResponse) => {
  console.log('ZOOM BODY:', {...request.body});

  if (request.headers['authorization'] !== process.env.ZOOM_WEBHOOK_TOKEN) {
    return response.status(401);
  }

  const wyze = new Wyze({
    username: process.env.WYZE_USERNAME,
    password: process.env.WYZE_PASSWORD,
  });

  const devices = await wyze.getDeviceList();
  const filtered = devices.filter(
    (x) =>
      deviceTypes.includes(x.product_type) &&
      x.nickname.startsWith(devicePrefix),
  );

  console.log('DEVICES: ', filtered);

  const promises = filtered.map((device) => wyze.turnOn(device));
  await Promise.all(promises);

  response.status(200).send({});
};
