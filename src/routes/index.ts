import exampleController from "./../controllers/example.controller";
import express from "express";

const router = express.Router();

router.route("/example").get(exampleController.main);

export default router;
