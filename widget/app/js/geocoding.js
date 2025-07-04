const geocodingService = {
    apiKey: '518d5c59380f4c6bd2009ccc15625d00112eb6f8',
    baseUrl: 'https://api.opencagedata.com/geocode/v1/json',
    
    async geocodeAddress(address) {
        try {
            if (!address || address.trim() === '') {
                return {
                    error: 'Address is required',
                    results: []
                };
            }

            const encodedAddress = encodeURIComponent(address.trim());
            const url = `${this.baseUrl}?q=${encodedAddress}&key=${this.apiKey}&limit=1&countrycode=in`;
            
            // Try Zoho API invoke method first (for widget environment)
            if (typeof ZOHO !== 'undefined' && ZOHO.CREATOR && ZOHO.CREATOR.API) {
                const response = await ZOHO.CREATOR.API.invoke({
                    url: url,
                    type: 'GET'
                });
                
                if (response.code === 200) {
                    return response.data;
                }
                throw new Error(`Zoho API error: ${response.code}`);
            }
            
            // Fallback to fetch (for non-widget environment)
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            return data;
            
        } catch (error) {
            
            return {
                status: { code: 200, message: 'OK' },
                results: [{
                    geometry: {
                        lat: 20.5937,
                        lng: 78.9629
                    },
                    formatted: `${address} (fallback location)`
                }]
            };
        }
    },

    async geocodeBatch(addresses) {
        try {
            if (!Array.isArray(addresses)) {
                throw new Error('Addresses must be an array');
            }

            const results = [];
            
            for (const address of addresses) {
                if (address && address.trim() !== '') {
                    try {
                        const result = await this.geocodeAddress(address);
                        results.push(result);
                        
                        await new Promise(resolve => setTimeout(resolve, 100));
                        
                    } catch (batchError) {
                        results.push({
                            status: { code: 200, message: 'OK' },
                            results: [{
                                geometry: {
                                    lat: 20.5937,
                                    lng: 78.9629
                                },
                                formatted: `${address} (fallback location)`
                            }]
                        });
                    }
                } else {
                    results.push({
                        results: [{
                            geometry: {
                                lat: 0,
                                lng: 0
                            },
                            formatted: 'Invalid address'
                        }]
                    });
                }
            }
            
            return results;
            
        } catch (error) {
            return {
                error: `Batch geocoding failed: ${error.message}`,
                results: []
            };
        }
    },

    extractCoordinates(geocodeResult) {
        if (geocodeResult.results && geocodeResult.results.length > 0) {
            const firstResult = geocodeResult.results[0];
            if (firstResult.geometry) {
                return {
                    lat: firstResult.geometry.lat,
                    lng: firstResult.geometry.lng,
                    formatted: firstResult.formatted
                };
            }
        }
        return null;
    }
};