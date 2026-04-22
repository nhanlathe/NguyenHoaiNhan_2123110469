
const axios = require('axios');

async function testCreate() {
    try {
        const payload = {
            sku: 'TEST-001',
            name: 'Test Product',
            uoM: 'Cái',
            basePrice: 10000,
            department: 'Sách',
            category: 'Giáo khoa',
            isVirtual: false,
            metadataJson: JSON.stringify({ "Tác giả": "Test" })
        };
        console.log("Sending payload:", payload);
        const res = await axios.post('http://localhost:5245/api/Products', payload);
        console.log("Success:", res.data);
    } catch (err) {
        console.error("Error Status:", err.response?.status);
        console.error("Error Data:", JSON.stringify(err.response?.data, null, 2));
    }
}

testCreate();
