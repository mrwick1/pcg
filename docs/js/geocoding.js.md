# geocoding.js Documentation

## Overview
Geocoding service providing address-to-coordinate conversion using OpenCage Data API. Supports both Zoho Creator widget environment and standalone usage with comprehensive error handling and fallback mechanisms.

## API Configuration
- **Service**: OpenCage Data API
- **API Key**: `518d5c59380f4c6bd2009ccc15625d00112eb6f8`
- **Base URL**: `https://api.opencagedata.com/geocode/v1/json`
- **Rate Limiting**: 100ms delay between batch requests
- **Country Code**: `in` (India-focused)

## Key Functions

### geocodeAddress(address)
Primary geocoding function for single address conversion.

**Parameters:**
- `address` (string): Address string to geocode

**Returns:**
- `Object`: Geocoding response with results array

**Features:**
- Input validation and trimming
- URL encoding for safe API transmission
- Dual execution environment support (Zoho/standalone)
- Comprehensive error handling with fallback coordinates
- India-specific country code filtering
- Automatic fallback to central India coordinates (20.5937, 78.9629)

**Execution Flow:**
1. Validates input address
2. Tries Zoho Creator API invoke method first
3. Falls back to standard fetch for non-widget environments
4. Returns structured response or fallback data on error

### geocodeBatch(addresses)
Batch geocoding function for processing multiple addresses efficiently.

**Parameters:**
- `addresses` (Array): Array of address strings

**Returns:**
- `Array`: Array of geocoding results corresponding to input addresses

**Features:**
- Input validation for array type
- Individual address processing with error isolation
- 100ms delay between requests to respect rate limits
- Graceful error handling per address
- Fallback coordinates for failed addresses
- Progress tracking and logging

**Rate Limiting:**
Implements 100ms delays between requests to prevent API rate limit violations:
```javascript
await new Promise(resolve => setTimeout(resolve, 100));
```

### extractCoordinates(geocodeResult)
Utility function to extract standardized coordinate data from API responses.

**Parameters:**
- `geocodeResult` (Object): Raw geocoding API response

**Returns:**
- `Object`: Standardized coordinate object or `null`
  ```javascript
  {
      lat: number,
      lng: number,
      formatted: string
  }
  ```

**Logic:**
- Validates response structure
- Extracts first result from results array
- Returns geometry coordinates and formatted address
- Returns `null` for invalid responses

## Environment Detection

### Zoho Creator Integration
Automatically detects and uses Zoho Creator API when available:
```javascript
if (typeof ZOHO !== 'undefined' && ZOHO.CREATOR && ZOHO.CREATOR.API) {
    const response = await ZOHO.CREATOR.API.invoke({
        url: url,
        type: 'GET'
    });
}
```

### Standalone Fallback
Uses standard fetch API in non-widget environments:
```javascript
const response = await fetch(url);
```

## Error Handling

### Comprehensive Fallback System
- **Network Errors**: Returns fallback coordinates
- **API Errors**: Logs error and provides default response
- **Invalid Input**: Returns error response with empty results
- **Rate Limiting**: Implements delays and retry logic

### Fallback Coordinates
Default to central India location when geocoding fails:
- **Latitude**: 20.5937
- **Longitude**: 78.9629
- **Location**: Geographic center of India

### Error Response Structure
```javascript
{
    status: { code: 200, message: 'OK' },
    results: [{
        geometry: { lat: 20.5937, lng: 78.9629 },
        formatted: `${address} (fallback location)`
    }]
}
```

## API Response Handling

### Expected Response Format
```javascript
{
    status: { code: number, message: string },
    results: [{
        geometry: { lat: number, lng: number },
        formatted: string,
        // ... other OpenCage fields
    }]
}
```

### Response Validation
- Checks for results array existence
- Validates geometry object structure
- Ensures coordinate data types are numbers

## Configuration Options

### URL Construction
```javascript
const url = `${this.baseUrl}?q=${encodedAddress}&key=${this.apiKey}&limit=1&countrycode=in`;
```

**Parameters:**
- `q`: Encoded address query
- `key`: API authentication key
- `limit`: Maximum results (set to 1)
- `countrycode`: Country filter (set to 'in' for India)

## Usage Examples

### Single Address Geocoding
```javascript
const result = await geocodingService.geocodeAddress("123 Main St, Mumbai");
const coordinates = geocodingService.extractCoordinates(result);
if (coordinates) {
    console.log(`Lat: ${coordinates.lat}, Lng: ${coordinates.lng}`);
}
```

### Batch Address Geocoding
```javascript
const addresses = ["Address 1", "Address 2", "Address 3"];
const results = await geocodingService.geocodeBatch(addresses);
```

## Dependencies
- **OpenCage Data API**: External geocoding service
- **Zoho Creator API** (optional): For widget environment API calls
- **Fetch API**: For standalone environment HTTP requests

## Notes
- Designed for India-specific address geocoding
- Provides graceful degradation in all error scenarios
- Supports both development and production environments
- Implements proper rate limiting for API compliance
- Returns consistent response format regardless of execution environment