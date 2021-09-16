import express from "express";

// node js express controller

const exampleController: any = {}

exampleController.main = async (
  req: express.Request,
  res: express.Response
): Promise<express.Response> => {
  try {
    console.log(req.body);

    return res.json({
      message: "Hello World",
    });
  } catch (error) {
    console.log(error);
    return res.json({
      error: "Internal Error",
    });
  }
};

export default exampleController;