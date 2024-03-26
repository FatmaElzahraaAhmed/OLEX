const schedule = require("node-schedule");
const moment = require("moment");
const path = require("path");
const productModel = require("../DB/model/product");
const userModel = require("../DB/model/user");
const { createProductsTable } = require("./pdf");
const sendEmail = require("./sendEmail");

function cronJobs() {
  const sendCreatedProductsPdf = async () => {
    const today = moment(new Date()).format("YYYY-MM-DD");
    const products = await productModel
      .find({
        createdAt: { $lte: today },
        isDeleted: false,
      })
      .select("_id productTitle productDesc productPrice");
      
    const admins = await userModel
      .find({
        isDeleted: false,
        confirmed: true,
        blocked: false,
        role: "admin",
      })
      .select("-_id email");
    const pdfPath = path.join(__dirname, `../uploads/PDFs/Products`);
    const pdfName = `${today}_products.pdf`;

    if (products.length > 0 && admins.length > 0) {
      createProductsTable({ items: products }, pdfPath, pdfName);
      const adminsEmails = admins.map((admin) => admin.email);
      const adminsEmailsWithComma = adminsEmails.join(",");
      sendEmail(
        adminsEmailsWithComma,
        "<p>Daily report of created products</p>",
        {
          path: `${pdfPath}/${pdfName}`,
        }
      );
    } else {
      console.log("no products created today");
    }
  };
  schedule.scheduleJob('59 59 23 * * * *', sendCreatedProductsPdf)
}

module.exports = cronJobs;
