import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import ImageKit from "@imagekit/nodejs";

console.log("Loaded Key:", process.env.IMAGEKIT_PRIVATE_KEY);

const imageKit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
});

export default imageKit;