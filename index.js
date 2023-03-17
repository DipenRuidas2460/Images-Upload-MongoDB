const express = require("express");

const fs = require('fs')

const mongoose = require("mongoose");

const multer = require("multer");

let methodOverride = require('method-override')

require("dotenv").config();

const app = express();

app.set("view engine", "ejs");

app.use(express.static("public"));

app.use(methodOverride('_method'))

const url = process.env.MONGO_URL;

mongoose
    .connect(url, {
        useNewUrlParser: true
    })

    .then(() => {
        console.log("Connected to MongoDB Sucessfully!");
    })
    .catch((err) => console.log(err));

let mySchema = mongoose.Schema({
    Picture: String
});

let myModel = mongoose.model("table", mySchema);

// Stroage Setting:---

let stroage = multer.diskStorage({
    destination: "./public/images", // directory (folder setting)
    filename: (req, file, cb) => {
        cb(null, file.originalname); //file name setting
    },
});

// Upload Setting:---

let upload = multer({
    storage: stroage,
    fileFilter: (req, file, cb) => {
        if (
            file.mimetype === "image/jpeg" ||
            file.mimetype === "image/jpg" ||
            file.mimetype === "image/png" ||
            file.mimetype === "image/gif" ||
            file.mimetype === "image/webp"
        ) {
            cb(null, true);
        } else {
            cb(null, false);
            cb(new Error("Only jpeg, jpg, png, gif, webp image type allowed!"));
        }
    }
});

// Single Image uploading:---

app.post("/singlepost", upload.single("single_input"), (req, res) => {
    req.file;
    if (!req.file) {
        return console.log('You have not Select any Image, Please Select any Image on Your Computer')
    }
    myModel
        .findOne({ Picture: req.file.filename })
        .then((a) => {
            if (a) {
                return console.log("Duplicate Image");
            } else {
                myModel
                    .create({ Picture: req.file.filename })
                    .then(() => {
                        return res.status(302).redirect("/view");
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            }
        })
        .catch((err) => {
            console.log(err);
        });
});

// Multiple Images uploading:---

app.post("/multiplepost", upload.array("multiple_input", 3), (req, res) => {
    if(!req.files){
        return console.log('You have not Select any Image, Please Select any Image on Your Computer')
    }
    req.files.forEach((v) => {
        myModel
            .findOne({ Picture: v.filename })
            .then((a) => {
                if (a) {
                    return console.log("Duplicate Image");
                } else {
                    myModel
                        .create({ Picture: v.filename })
                        .then(() => {
                            return res.redirect("/view");
                        })
                        .catch((err) => {
                            return console.log(err);
                        });
                }
            })
            .catch((err) => {
                return console.log(err);
            });
    });
});

app.get("/", (req, res) => {
    res.render("index");
});

app.get('/edit/:id', (req, res) => {
    let readquery = { _id: req.params.id };
    res.render('edit-file', { readquery })
})

app.put('/edit/:id', upload.single('single_input'), (req, res) => {
    myModel.findOneAndUpdate({ _id: req.params.id }, {
        Picture: req.file.filename
    }, { new: true })
        .then((x) => {
            res.redirect('/view')
        })
        .catch((y) => {
            console.log(y)
        })
})


app.delete('/delete/:id', (req, res) => {
    let curretn_img_url = (__dirname + '/public/images/' + req.params.id);
    fs.unlinkSync(curretn_img_url)
    myModel.deleteOne({ Picture: req.params.id })
        .then(() => {
            res.redirect('/view')
        })
        .catch((y) => {
            console.log(y)
        })
})

app.get("/view", (req, res) => {
    myModel
        .find({})
        .then((x) => {
            res.render("preview", { x });
        })
        .catch((err) => {
            console.log(err)
        });
});

const port = process.env.PORT;

app.listen(port, () => {
    console.log("Express app port running on:-", port);
});
