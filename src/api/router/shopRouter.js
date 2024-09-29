import Router from 'express'
import {shopSignUp,getShops,getShopDetail,
        ownerDetail, shopLogin,deleteShopImage,uploadShopImage,openclosed,
        updateShopData,deleteShop} from '../controller/shopController.js'
import { upload  } from '../middleware/multerMiddleWare.js';

const router=Router();

//LOGIN SIGNUP
router.route('/signup').post(upload.array('images'),shopSignUp)
router.route('/login').post(shopLogin)

//GET INFO
router.route('/getshops').post(getShops)
router.route('/getshopdetails').get(getShopDetail)
router.route('/getowner').post(ownerDetail)

//DELETE UPLOAD IMAGES
router.route('/deleteshopimage').delete(upload.array('images'),deleteShopImage)
router.route('/uploadshopimage').post(upload.array('images'),uploadShopImage)

//UPDATE SHOP STATUS OPEN OR CLOSED
router.route('/openclosed').put(openclosed);

//UPDATE SHOP DATA
router.route('/updateshopdata').post(upload.array('images'),updateShopData)

//DELETE SHOP
router.route('/deleteshop').post(deleteShop)

export default router;

