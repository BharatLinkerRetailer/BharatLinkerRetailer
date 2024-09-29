/**
 * Class representing an API response.
 * 
 * This class encapsulates the structure of a response returned from an API endpoint.
 */
class ApiResponse {
    /**
     * Creates an instance of ApiResponse.
     * 
     * @param {number} statusCode - The HTTP status code of the response.
     * @param {Object|Array|null} data - The response data (can be an object, array, or null).
     * @param {string} [message="Success"] - A message indicating the result of the operation.
     */
    constructor(statusCode, data, message = "Success") {
        this.statusCode = statusCode; // HTTP status code
        this.data = data;              // Response data
        this.message = message;        // Response message
        this.success = statusCode < 400; // Indicates if the response is successful
    }
}

export { ApiResponse };
