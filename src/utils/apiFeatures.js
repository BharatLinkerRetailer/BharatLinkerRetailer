class apiFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    // Method for searching shops by name
    searchShop() {
        if (this.queryString.search) {
            const searchTerm = this.queryString.search;
            this.query = this.query.find({
                shopName: { $regex: searchTerm, $options: 'i' }, // Case-insensitive search
            });
        }
        return this; // Return this for method chaining
    }

    // Method for filtering by pincode
    filterByPincode() {
        if (this.queryString.pincode) {
            const pincode = this.queryString.pincode.split(',');
            this.query = this.query.find({ pinCodes: { $in: pincode } });
        }
        return this;
    }
}

export { apiFeatures };
