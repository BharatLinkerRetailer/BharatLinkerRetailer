class apiFeatures {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }

    search() {
        const keyword = this.queryStr.keyword ? this.queryStr.keyword.trim() : '';
        if (keyword) {
            const regex = new RegExp(keyword, 'i');
            this.query = this.query.find({
                $or: [
                    { title: { $regex: regex } },
                    { description: { $regex: regex } },
                    { category: { $elemMatch: { $regex: regex } } },
                    { brand: { $regex: regex } },
                    { keyWords: { $elemMatch: { $regex: regex } } }
                ]
            });
        }
        return this;
    }

    searchShop() {
        const keyword = this.queryStr.keyword ? this.queryStr.keyword.trim() : '';
        if (keyword) {
            const regex = new RegExp(keyword, 'i');
            this.query = this.query.find({
                shopName: { $regex: regex },
            });
        }
        return this;
    }

    filterByPincode() {
        const pincode = this.queryStr.pincode;
        if (pincode) {
            // Split the pincode string by comma, trim any whitespace, and convert each to a number
            const pincodeArray = pincode.split(',').map(pin => Number(pin.trim()));
    
            // Find the documents where pinCodes contains any of the values in pincodeArray
            this.query = this.query.find({ pinCodes: { $in: pincodeArray } });
        }
        return this;
    }
    

    filterByCategory() {
        const categories = this.queryStr.category;
        if (categories) {
            const categoryArray = categories.split(',').map(category => new RegExp(category.trim(), 'i')); // Create regex for partial matches
            this.query = this.query.find({ 
                category: { $in: categoryArray } // Check if any element in the shop's category array matches
            });
        }
        return this;
    }
    
    
    

    filterByBrand() {
        const brands = this.queryStr.brands;
        if (brands) {
            const brandArray = brands.split(',').map(brand => brand.trim());
            this.query = this.query.find({ brand: { $in: brandArray } });
        }
        return this;
    }

    filterByShop() {
        const shopId = this.queryStr.shopid;
        if (shopId) {
            this.query = this.query.find({ shop: shopId });
        }
        return this;
    }

    pagination(resultPerPage) {
        const currentPage = parseInt(this.queryStr.page, 10) || 1;
        const skip = (currentPage - 1) * resultPerPage;

        this.query = this.query.skip(skip).limit(resultPerPage);
        return this;
    }

    filter() {
        const queryCopy = { ...this.queryStr };
        const removeFields = ["keyword", "page", "limit", "pincode", "categories", "shopid"];
        removeFields.forEach((key) => delete queryCopy[key]);

        for (const key in queryCopy) {
            if (!isNaN(parseInt(queryCopy[key]))) {
                queryCopy[key] = parseInt(queryCopy[key]);
            }
        }

        if (Object.keys(queryCopy).length) {
            this.query = this.query.find(queryCopy);
        }
        return this;
    }

    getFilter() {
        return this.query.getFilter();  // Access the filter conditions for countDocuments
    }

    filterByRegisterStatus() {
        // Only include shops that have registerStatus === 'approved'
        this.query = this.query.find({ registerStatus: 'approved' });
        return this;
    }
}

export { apiFeatures };