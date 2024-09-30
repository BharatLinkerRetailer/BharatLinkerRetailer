// import multer from "multer";
// const storage = multer.diskStorage({
//     destination:function(req,file,cb){
//         cb(null,"./public/temp")
//     },
//     filename:function(req,file,cb){
//         cb(null,file.originalname)
//     }
// });
// export  const upload = multer({ storage });
import multer from "multer";

// Set up memory storage for multer
const storage = multer.memoryStorage(); // Store files in memory

// Initialize multer with the memory storage
export const upload = multer({ 
    storage, 
    limits: { fileSize: 10 * 1024 * 1024 } // Optional: Set a file size limit (10 MB here)
});
