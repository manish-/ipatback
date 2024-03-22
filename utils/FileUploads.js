const express = require('express');
const fs = require('fs');
const multer = require('multer');
const path = require('path');

// const upload = multer({ dest: 'uploads/' })
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let path_url = path.resolve(__dirname, '..');
		cb(null, `${path_url}/public/uploads/temp`);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now()+ '-' + Math.round(Math.random() * 1E9)

    cb(null, uniqueSuffix + '.' + file.originalname.split('.').pop());

    // cb(null, file.originalname.split('.').slice(0, -1).join('.') + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  }
})

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024*1024*2 },
  fileFilter: (req, file, cb) => {
    const ext = file.originalname.split('.').pop();
    const validExts = ['jpg','jpeg','png','doc','docx','pdf'];
    if (validExts.includes(ext)) {
      cb(null, true);
    }else {
      cb(null, false);
      return cb(new Error(`only ${validExts} allowed`));
    }
  }
})


const upload_banner = multer({
  storage: storage,
  limits: { fileSize: 1024*1024*2 },
  fileFilter: (req, file, cb) => {
    
    const ext = file.originalname.split('.').pop();
    const validExts = ['jpg','jpeg','png' ];
    if (validExts.includes(ext)) {
      cb(null, true);
    }else {
      req.fileValidationError =`only ${validExts} allowed`;
      cb(null, false);
      // return cb(new Error(`only ${validExts} allowed`));
      // return cb({"status":"error","message":`only ${validExts} allowed`});
    }
  }
})

const moveFile =(oldFilePath,NewFilePath)=>{

  return new Promise((fulfill,reject)=>{
    fs.rename(oldFilePath, NewFilePath, function (err) {
      if (err) reject(err);
      // fs.unlinkSync(oldFilePath);
      fulfill(true);      
    }); 
  });
};



module.exports = {upload,upload_banner,moveFile};