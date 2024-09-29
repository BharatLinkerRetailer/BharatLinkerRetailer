import multer from "multer";

// Set up memory storage for multer
const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,"./public/temp")
    },
    filename:function(req,file,cb){
        cb(null,file.originalname)
    }
}); // This stores files in memory, adjust as necessary for your needs

// Initialize multer with the defined stora
export  const upload = multer({ storage });