// --- ZOHO BACKEND APIS (Placeholder - Not Used Directly for Mock) ---
// const ZOHO_API_BASE_URL = "https://creator.zoho.com/api/v2/your_org_name/your_app_name/report/";
// ---

// Dummy Roles List
const DUMMY_ROLES = ["Developer", "Manager", "QA Tester", "Designer", "Consultant", "Team Lead", "Project Manager", "DevOps Engineer"];

// Expanded Mock data
const mockLocationsData = [
    {
        id: 1,
        name: "Mumbai Fintech Hub (Live)",
        address: "BKC, Mumbai, Maharashtra 400051, India",
        lat: 19.0669,
        lng: 72.8693,
        project_status: "Live",
        billing_location: "Mumbai HQ",
        resource_location: "Mumbai BKC Campus",
        role: "Project Manager",
        resource_status: "Active"
    },
    {
        id: 2,
        name: "Delhi AI Initiative (Live)",
        address: "Connaught Place, New Delhi, Delhi 110001, India",
        lat: 28.6324,
        lng: 77.2170,
        project_status: "Live",
        billing_location: "Delhi Office",
        resource_location: "Delhi Tech Park",
        role: "Consultant",
        resource_status: "Active"
    },
    {
        id: 3,
        name: "Bangalore Cloud Migration (Live)",
        address: "Koramangala, Bangalore, Karnataka 560034, India",
        lat: 12.9352,
        lng: 77.6245,
        project_status: "Live",
        billing_location: "Bangalore Office",
        resource_location: "Bangalore Koramangala Site",
        role: "DevOps Engineer",
        resource_status: "Active"
    },
    {
        id: 4,
        name: "Chennai Logistics App (Suspended)",
        address: "T. Nagar, Chennai, Tamil Nadu 600017, India",
        lat: 13.0408,
        lng: 80.2338,
        project_status: "Suspended",
        billing_location: "Chennai Branch",
        resource_location: "Chennai Ops Center",
        role: "Developer",
        resource_status: "Inactive"
    },
    {
        id: 5,
        name: "Hyderabad Gaming Project (Archived)",
        address: "Gachibowli, Hyderabad, Telangana 500032, India",
        lat: 17.4440,
        lng: 78.3523,
        project_status: "Archived",
        billing_location: "Hyderabad Office",
        resource_location: "Hyderabad Gaming Studio",
        role: "Designer",
        resource_status: "Inactive"
    },
    {
        id: 6,
        name: "Pune Automotive Software (Cancelled)",
        address: "Hinjawadi, Pune, Maharashtra 411057, India",
        lat: 18.5844,
        lng: 73.6943,
        project_status: "Cancelled",
        billing_location: "Pune Office",
        resource_location: "Pune Tech Hub",
        role: "QA Tester",
        resource_status: "Active"
    },
    {
        id: 7,
        name: "Kolkata E-commerce Platform (Live)",
        address: "Salt Lake, Kolkata, West Bengal 700091, India",
        lat: 22.5800,
        lng: 88.4000,
        project_status: "Live",
        billing_location: "Kolkata Office",
        resource_location: "Kolkata IT Park",
        role: "Developer",
        resource_status: "Active"
    },
    {
        id: 8,
        name: "Ahmedabad Smart City Project (Live)",
        address: "SG Highway, Ahmedabad, Gujarat 380060, India",
        lat: 23.0225,
        lng: 72.5714,
        project_status: "Live",
        billing_location: "Ahmedabad Office",
        resource_location: "Ahmedabad Smart City Center",
        role: "Manager",
        resource_status: "Active"
    },
    {
        id: 9,
        name: "Jaipur Tourism App (Live)",
        address: "MI Road, Jaipur, Rajasthan 302001, India",
        lat: 26.9124,
        lng: 75.7873,
        project_status: "Live",
        billing_location: "Jaipur Office",
        resource_location: "Jaipur Dev Team",
        role: "Designer",
        resource_status: "Active"
    },
    {
        id: 10,
        name: "Lucknow Gov Project (Suspended)",
        address: "Hazratganj, Lucknow, Uttar Pradesh 226001, India",
        lat: 26.8467,
        lng: 80.9462,
        project_status: "Suspended",
        billing_location: "Lucknow Office",
        resource_location: "Lucknow Gov Office",
        role: "Consultant",
        resource_status: "On Bench"
    },
    {
        id: 11,
        name: "Chandigarh Infra Upgrade (Live)",
        address: "Sector 17, Chandigarh, 160017, India",
        lat: 30.7333,
        lng: 76.7794,
        project_status: "Live",
        billing_location: "Chandigarh Office",
        resource_location: "Chandigarh Site Office",
        role: "DevOps Engineer",
        resource_status: "Active"
    },
    {
        id: 12,
        name: "Bhopal Green Initiative (Live)",
        address: "MP Nagar, Bhopal, Madhya Pradesh 462011, India",
        lat: 23.2390,
        lng: 77.4230,
        project_status: "Live",
        billing_location: "Bhopal Office",
        resource_location: "Bhopal Green Energy Park",
        role: "Manager",
        resource_status: "Active"
    },
    {
        id: 13,
        name: "Indore Startup Hub (Live)",
        address: "Vijay Nagar, Indore, Madhya Pradesh 452010, India",
        lat: 22.7533,
        lng: 75.8937,
        project_status: "Live",
        billing_location: "Indore Office",
        resource_location: "Indore Incubation Center",
        role: "Team Lead",
        resource_status: "Active"
    },
    {
        id: 14,
        name: "Nagpur Logistics Portal (Live)",
        address: "Civil Lines, Nagpur, Maharashtra 440001, India",
        lat: 21.1458,
        lng: 79.0882,
        project_status: "Live",
        billing_location: "Nagpur Office",
        resource_location: "Nagpur Warehouse Site",
        role: "Developer",
        resource_status: "Active"
    },
    {
        id: 15,
        name: "Patna EdTech Platform (Live)",
        address: "Bailey Road, Patna, Bihar 800001, India",
        lat: 25.6000,
        lng: 85.1000,
        project_status: "Live",
        billing_location: "Patna Office",
        resource_location: "Patna Dev Center",
        role: "QA Tester",
        resource_status: "Active"
    },
    {
        id: 16,
        name: "Gurgaon Fintech Solution (Live)",
        address: "Cyber City, Gurgaon, Haryana 122002, India",
        lat: 28.4979,
        lng: 77.0800,
        project_status: "Live",
        billing_location: "Gurgaon HQ",
        resource_location: "Gurgaon Cyber Hub",
        role: "Project Manager",
        resource_status: "Active"
    },
    {
        id: 17,
        name: "Noida BPO Operations (Live)",
        address: "Sector 62, Noida, Uttar Pradesh 201309, India",
        lat: 28.6210,
        lng: 77.3781,
        project_status: "Live",
        billing_location: "Noida BPO Center",
        resource_location: "Noida Sector 62",
        role: "Manager",
        resource_status: "Active"
    },
    {
        id: 18,
        name: "Mumbai Marketing Campaign (Live)",
        address: "Andheri, Mumbai, Maharashtra 400053, India",
        lat: 19.1197,
        lng: 72.8464,
        project_status: "Live",
        billing_location: "Mumbai HQ",
        resource_location: "Mumbai Andheri Office",
        role: "Designer",
        resource_status: "Active"
    },
    {
        id: 19,
        name: "Bangalore Support Team (Suspended)",
        address: "Whitefield, Bangalore, Karnataka 560066, India",
        lat: 12.9698,
        lng: 77.7500,
        project_status: "Suspended",
        billing_location: "Bangalore Office",
        resource_location: "Bangalore Whitefield Campus",
        role: "Consultant",
        resource_status: "On Bench"
    },
    {
        id: 20,
        name: "Pune Client Demo (Live)",
        address: "Kalyani Nagar, Pune, Maharashtra 411006, India",
        lat: 18.5413,
        lng: 73.9064,
        project_status: "Live",
        billing_location: "Pune Office",
        resource_location: "Pune Client Site",
        role: "Team Lead",
        resource_status: "Active"
    },
    {
        id: 21,
        name: "Delhi Maintenance Contract (Archived)",
        address: "Nehru Place, New Delhi, Delhi 110019, India",
        lat: 28.5484,
        lng: 77.2525,
        project_status: "Archived",
        billing_location: "Delhi Office",
        resource_location: "Delhi On-Site Support",
        role: "Developer",
        resource_status: "Inactive"
    }
];

// Simulates fetching data from Zoho Creator
async function fetchMockReportData(filters = {}) {
    console.log("Fetching mock data with filters:", filters);
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay

    let filteredData = mockLocationsData;

    // Project Status Filter
    if (filters.project_status) {
        filteredData = filteredData.filter(item => item.project_status === filters.project_status);
    }

    // Billing Location Filter
    if (filters.billing_location) {
        filteredData = filteredData.filter(item => item.billing_location === filters.billing_location);
    }

    // Resource Location Main Filter
    if (filters.resource_location) {
        filteredData = filteredData.filter(item => item.resource_location === filters.resource_location);

        // Role Sub-Filter (applied if a resource_location is also selected)
        if (filters.role) {
            filteredData = filteredData.filter(item => item.role === filters.role);
        }

        // Status Sub-Filter (applied if a resource_location is also selected)
        if (filters.resource_status) {
            filteredData = filteredData.filter(item => item.resource_status === filters.resource_status);
        }
    } 
    // Note: If you wanted role/status to be global filters even without a resource_location, 
    // you would un-indent the role and resource_status filter blocks above.
    // The current logic ties them to a selected resource_location.

    console.log("Returning filtered mock data:", filteredData.length, "items");
    return { data: filteredData };
}

function getUniqueValues(key) {
    const values = new Set();
    for (const item of mockLocationsData) {
        if (item[key]) values.add(item[key]);
    }
    return Array.from(values).sort();
}

// Expose available roles for filter population
function getAvailableRoles() {
    return DUMMY_ROLES.sort();
}