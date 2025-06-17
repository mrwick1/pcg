// --- SEPARATE API ENDPOINTS ---
// Three independent data sources: Projects, Resources, Billing Locations

// PROJECT DATA - Separate API endpoint
const mockProjectsData = [
    {
        projectStructure: {
            pccNumber: "06014",
            projectType: "Non-CAT - Civil/Structural",
            clientProjectNumber: "567",
            accountName: "Mumbai Financial Services",
            claimNumber: "MUM001",
            insurer: "Mumbai Insurance Co",
            carrierName: "Mumbai Financial Services",
            projectName: "Mumbai Fintech Hub",
            projectAddress: "BKC, Mumbai, Maharashtra 400051, India"
        },
        lat: 19.0669,
        lng: 72.8693
    },
    {
        projectStructure: {
            pccNumber: "06015",
            projectType: "CAT - Technology",
            clientProjectNumber: "568",
            accountName: "Delhi Tech Solutions",
            claimNumber: "DEL001",
            insurer: "Delhi Tech Insurance",
            carrierName: "Delhi Tech Solutions",
            projectName: "Delhi AI Initiative",
            projectAddress: "Connaught Place, New Delhi, Delhi 110001, India"
        },
        lat: 28.6324,
        lng: 77.2170
    },
    {
        projectStructure: {
            pccNumber: "06016",
            projectType: "Non-CAT - IT Infrastructure",
            clientProjectNumber: "569",
            accountName: "Bangalore Cloud Corp",
            claimNumber: "BLR001",
            insurer: "Bangalore IT Insurance",
            carrierName: "Bangalore Cloud Corp",
            projectName: "Bangalore Cloud Migration",
            projectAddress: "Koramangala, Bangalore, Karnataka 560034, India"
        },
        lat: 12.9352,
        lng: 77.6245
    },
    {
        projectStructure: {
            pccNumber: "06017",
            projectType: "CAT - Logistics",
            clientProjectNumber: "570",
            accountName: "Chennai Logistics Ltd",
            claimNumber: "CHE001",
            insurer: "Chennai Transport Insurance",
            carrierName: "Chennai Logistics Ltd",
            projectName: "Chennai Logistics App",
            projectAddress: "T. Nagar, Chennai, Tamil Nadu 600017, India"
        },
        lat: 13.0408,
        lng: 80.2338
    },
    {
        projectStructure: {
            pccNumber: "06018",
            projectType: "Non-CAT - Gaming",
            clientProjectNumber: "571",
            accountName: "Hyderabad Gaming Studios",
            claimNumber: "HYD001",
            insurer: "Hyderabad Entertainment Insurance",
            carrierName: "Hyderabad Gaming Studios",
            projectName: "Hyderabad Gaming Project",
            projectAddress: "Gachibowli, Hyderabad, Telangana 500032, India"
        },
        lat: 17.4440,
        lng: 78.3523
    },
    {
        projectStructure: {
            pccNumber: "06019",
            projectType: "CAT - Automotive",
            clientProjectNumber: "572",
            accountName: "Pune Auto Solutions",
            claimNumber: "PUN001",
            insurer: "Pune Automotive Insurance",
            carrierName: "Pune Auto Solutions",
            projectName: "Pune Automotive Software",
            projectAddress: "Hinjawadi, Pune, Maharashtra 411057, India"
        },
        lat: 18.5844,
        lng: 73.6943
    },
    {
        projectStructure: {
            pccNumber: "06020",
            projectType: "Non-CAT - E-commerce",
            clientProjectNumber: "573",
            accountName: "Kolkata E-commerce Ltd",
            claimNumber: "KOL001",
            insurer: "Kolkata Digital Insurance",
            carrierName: "Kolkata E-commerce Ltd",
            projectName: "Kolkata E-commerce Platform",
            projectAddress: "Salt Lake, Kolkata, West Bengal 700091, India"
        },
        lat: 22.5800,
        lng: 88.4000
    },
    {
        projectStructure: {
            pccNumber: "06021",
            projectType: "CAT - Smart City",
            clientProjectNumber: "574",
            accountName: "Ahmedabad Smart Solutions",
            claimNumber: "AHM001",
            insurer: "Ahmedabad Municipal Insurance",
            carrierName: "Ahmedabad Smart Solutions",
            projectName: "Ahmedabad Smart City Project",
            projectAddress: "SG Highway, Ahmedabad, Gujarat 380060, India"
        },
        lat: 23.0225,
        lng: 72.5714
    },
    {
        projectStructure: {
            pccNumber: "06022",
            projectType: "Non-CAT - Tourism",
            clientProjectNumber: "575",
            accountName: "Jaipur Tourism Board",
            claimNumber: "JAI001",
            insurer: "Jaipur Heritage Insurance",
            carrierName: "Jaipur Tourism Board",
            projectName: "Jaipur Tourism App",
            projectAddress: "MI Road, Jaipur, Rajasthan 302001, India"
        },
        lat: 26.9124,
        lng: 75.7873
    },
    {
        projectStructure: {
            pccNumber: "06023",
            projectType: "CAT - Government",
            clientProjectNumber: "576",
            accountName: "Lucknow Government Services",
            claimNumber: "LUC001",
            insurer: "Lucknow State Insurance",
            carrierName: "Lucknow Government Services",
            projectName: "Lucknow Gov Project",
            projectAddress: "Hazratganj, Lucknow, Uttar Pradesh 226001, India"
        },
        lat: 26.8467,
        lng: 80.9462
    }
];

// RESOURCE LOCATION DATA - Separate API endpoint
const mockResourcesData = [
    {
        resource: {
            employeeId: "382027000024782001",
            employeeName: {
                firstName: "Rajesh",
                lastName: "Kumar"
            },
            personalEmail: "rajesh.kumar@cloudq.net",
            phone: "+91 98765-43210",
            userRole: "Project Manager",
            employeeType: "Full Time",
            status: "Active",
            employeeNumber: "EMP001",
            dateOfBirth: "1985-05-15",
            addresses: {
                temporary: {
                    postalCode: "400051",
                    country: "India"
                },
                permanent: {
                    addressLine1: "Bandra Kurla Complex",
                    addressLine2: "BKC Main Road",
                    city: "Mumbai",
                    state: "Maharashtra",
                    postalCode: "400051",
                    country: "India"
                }
            }
        },
        lat: 19.0596,
        lng: 72.8656
    },
    {
        resource: {
            employeeId: "382027000024782002",
            employeeName: {
                firstName: "Priya",
                lastName: "Sharma"
            },
            personalEmail: "priya.sharma@cloudq.net",
            phone: "+91 98765-43211",
            userRole: "Senior Developer",
            employeeType: "Full Time",
            status: "Active",
            employeeNumber: "EMP002",
            dateOfBirth: "1988-08-22",
            addresses: {
                temporary: {
                    postalCode: "122002",
                    country: "India"
                },
                permanent: {
                    addressLine1: "Cyber City",
                    addressLine2: "DLF Phase 2",
                    city: "Gurgaon",
                    state: "Haryana",
                    postalCode: "122002",
                    country: "India"
                }
            }
        },
        lat: 28.4595,
        lng: 77.0266
    },
    {
        resource: {
            employeeId: "382027000024782003",
            employeeName: {
                firstName: "Amit",
                lastName: "Patel"
            },
            personalEmail: "amit.patel@cloudq.net",
            phone: "+91 98765-43212",
            userRole: "DevOps Engineer",
            employeeType: "Contract",
            status: "Active",
            employeeNumber: "EMP003",
            dateOfBirth: "1990-12-10",
            addresses: {
                temporary: {
                    postalCode: "560095",
                    country: "India"
                },
                permanent: {
                    addressLine1: "Koramangala 5th Block",
                    addressLine2: "80 Feet Road",
                    city: "Bangalore",
                    state: "Karnataka",
                    postalCode: "560095",
                    country: "India"
                }
            }
        },
        lat: 12.9279,
        lng: 77.6271
    },
    {
        resource: {
            employeeId: "382027000024782004",
            employeeName: {
                firstName: "Deepika",
                lastName: "Rao"
            },
            personalEmail: "deepika.rao@cloudq.net",
            phone: "+91 98765-43213",
            userRole: "QA Tester",
            employeeType: "Full Time",
            status: "Inactive",
            employeeNumber: "EMP004",
            dateOfBirth: "1987-03-25",
            addresses: {
                temporary: {
                    postalCode: "600119",
                    country: "India"
                },
                permanent: {
                    addressLine1: "OMR",
                    addressLine2: "Thoraipakkam",
                    city: "Chennai",
                    state: "Tamil Nadu",
                    postalCode: "600119",
                    country: "India"
                }
            }
        },
        lat: 12.8406,
        lng: 80.1534
    },
    {
        resource: {
            employeeId: "382027000024782005",
            employeeName: {
                firstName: "Vikram",
                lastName: "Singh"
            },
            personalEmail: "vikram.singh@cloudq.net",
            phone: "+91 98765-43214",
            userRole: "UI/UX Designer",
            employeeType: "Contract",
            status: "On Bench",
            employeeNumber: "EMP005",
            dateOfBirth: "1992-07-18",
            addresses: {
                temporary: {
                    postalCode: "500081",
                    country: "India"
                },
                permanent: {
                    addressLine1: "HITEC City",
                    addressLine2: "Madhapur",
                    city: "Hyderabad",
                    state: "Telangana",
                    postalCode: "500081",
                    country: "India"
                }
            }
        },
        lat: 17.4435,
        lng: 78.3772
    },
    {
        resource: {
            employeeId: "382027000024782006",
            employeeName: {
                firstName: "Sneha",
                lastName: "Joshi"
            },
            personalEmail: "sneha.joshi@cloudq.net",
            phone: "+91 98765-43215",
            userRole: "Technical Manager",
            employeeType: "Full Time",
            status: "Active",
            employeeNumber: "EMP006",
            dateOfBirth: "1984-11-30",
            addresses: {
                temporary: {
                    postalCode: "411013",
                    country: "India"
                },
                permanent: {
                    addressLine1: "Magarpatta",
                    addressLine2: "Hadapsar",
                    city: "Pune",
                    state: "Maharashtra",
                    postalCode: "411013",
                    country: "India"
                }
            }
        },
        lat: 18.5089,
        lng: 73.9260
    },
    {
        resource: {
            employeeId: "382027000024782007",
            employeeName: {
                firstName: "Arjun",
                lastName: "Das"
            },
            personalEmail: "arjun.das@cloudq.net",
            phone: "+91 98765-43216",
            userRole: "Full Stack Developer",
            employeeType: "Full Time",
            status: "Active",
            employeeNumber: "EMP007",
            dateOfBirth: "1989-09-12",
            addresses: {
                temporary: {
                    postalCode: "700156",
                    country: "India"
                },
                permanent: {
                    addressLine1: "New Town",
                    addressLine2: "Action Area 1",
                    city: "Kolkata",
                    state: "West Bengal",
                    postalCode: "700156",
                    country: "India"
                }
            }
        },
        lat: 22.5958,
        lng: 88.4692
    },
    {
        resource: {
            employeeId: "382027000024782008",
            employeeName: {
                firstName: "Test",
                lastName: "Kripa FE/NE"
            },
            personalEmail: "kripa@cloudq.net",
            phone: "+1 201-555-0123",
            userRole: "Nexus Engineers",
            employeeType: "Contract",
            status: "Active",
            employeeNumber: null,
            dateOfBirth: null,
            addresses: {
                temporary: {
                    postalCode: "201309",
                    country: "India"
                },
                permanent: {
                    addressLine1: "Sector 62",
                    addressLine2: "Noida",
                    city: "Noida",
                    state: "Uttar Pradesh",
                    postalCode: "201309",
                    country: "India"
                }
            }
        },
        lat: 28.6210,
        lng: 77.3781
    },
    {
        resource: {
            employeeId: "382027000024782009",
            employeeName: {
                firstName: "Ravi",
                lastName: "Nair"
            },
            personalEmail: "ravi.nair@cloudq.net",
            phone: "+91 98765-43218",
            userRole: "Team Lead",
            employeeType: "Full Time",
            status: "Active",
            employeeNumber: "EMP009",
            dateOfBirth: "1986-04-08",
            addresses: {
                temporary: {
                    postalCode: "682003",
                    country: "India"
                },
                permanent: {
                    addressLine1: "Willingdon Island",
                    addressLine2: "Marine Drive",
                    city: "Kochi",
                    state: "Kerala",
                    postalCode: "682003",
                    country: "India"
                }
            }
        },
        lat: 9.9647,
        lng: 76.2516
    },
    {
        resource: {
            employeeId: "382027000024782010",
            employeeName: {
                firstName: "Anita",
                lastName: "Gogoi"
            },
            personalEmail: "anita.gogoi@cloudq.net",
            phone: "+91 98765-43219",
            userRole: "Business Analyst",
            employeeType: "Full Time",
            status: "On Bench",
            employeeNumber: "EMP010",
            dateOfBirth: "1991-01-20",
            addresses: {
                temporary: {
                    postalCode: "781001",
                    country: "India"
                },
                permanent: {
                    addressLine1: "Pan Bazaar",
                    addressLine2: "Guwahati",
                    city: "Guwahati",
                    state: "Assam",
                    postalCode: "781001",
                    country: "India"
                }
            }
        },
        lat: 26.1833,
        lng: 91.7333
    }
];

// BILLING LOCATION DATA - Separate API endpoint
const mockBillingData = [
    {
        billing: {
            projectPccNumber: "06014",
            claimNumber: "MUM001",
            resourceId: "382027000024782001",
            resourceName: "Rajesh Kumar",
            paymentType: "Monthly Salary",
            billingStatus: "Active"
        },
        lat: 19.0176,
        lng: 72.8062
    },
    {
        billing: {
            projectPccNumber: "06015",
            claimNumber: "DEL001",
            resourceId: "382027000024782002",
            resourceName: "Priya Sharma",
            paymentType: "Monthly Salary",
            billingStatus: "Active"
        },
        lat: 28.6304,
        lng: 77.2177
    },
    {
        billing: {
            projectPccNumber: "06016",
            claimNumber: "BLR001",
            resourceId: "382027000024782003",
            resourceName: "Amit Patel",
            paymentType: "Hourly Contract",
            billingStatus: "Active"
        },
        lat: 12.9716,
        lng: 77.5946
    },
    {
        billing: {
            projectPccNumber: "06017",
            claimNumber: "CHE001",
            resourceId: "382027000024782004",
            resourceName: "Deepika Rao",
            paymentType: "Monthly Salary",
            billingStatus: "Inactive"
        },
        lat: 13.0878,
        lng: 80.2785
    },
    {
        billing: {
            projectPccNumber: "06018",
            claimNumber: "HYD001",
            resourceId: "382027000024782005",
            resourceName: "Vikram Singh",
            paymentType: "Project Based",
            billingStatus: "On Hold"
        },
        lat: 17.4126,
        lng: 78.4071
    },
    {
        billing: {
            projectPccNumber: "06019",
            claimNumber: "PUN001",
            resourceId: "382027000024782006",
            resourceName: "Sneha Joshi",
            paymentType: "Monthly Salary",
            billingStatus: "Active"
        },
        lat: 18.5196,
        lng: 73.8553
    },
    {
        billing: {
            projectPccNumber: "06020",
            claimNumber: "KOL001",
            resourceId: "382027000024782007",
            resourceName: "Arjun Das",
            paymentType: "Monthly Salary",
            billingStatus: "Active"
        },
        lat: 22.5448,
        lng: 88.3426
    },
    {
        billing: {
            projectPccNumber: "06021",
            claimNumber: "AHM001",
            resourceId: "382027000024782008",
            resourceName: "Test Kripa FE/NE",
            paymentType: "Not Selected",
            billingStatus: "Active"
        },
        lat: 23.0395,
        lng: 72.5610
    },
    {
        billing: {
            projectPccNumber: "06022",
            claimNumber: "JAI001",
            resourceId: "382027000024782009",
            resourceName: "Ravi Nair",
            paymentType: "Monthly Salary",
            billingStatus: "Active"
        },
        lat: 9.9816,
        lng: 76.2999
    },
    {
        billing: {
            projectPccNumber: "06023",
            claimNumber: "LUC001",
            resourceId: "382027000024782010",
            resourceName: "Anita Gogoi",
            paymentType: "Project Based",
            billingStatus: "On Hold"
        },
        lat: 28.4824,
        lng: 77.1025
    }
];

// PROJECT API
async function fetchProjectsData(filters = {}) {
    console.log("Fetching projects data with filters:", filters);
    await new Promise(resolve => setTimeout(resolve, 200));

    let filteredData = mockProjectsData;

    if (filters.pccNumber) {
        filteredData = filteredData.filter(item => item.projectStructure.pccNumber === filters.pccNumber);
    }

    if (filters.projectType) {
        filteredData = filteredData.filter(item => item.projectStructure.projectType === filters.projectType);
    }

    if (filters.accountName) {
        filteredData = filteredData.filter(item => item.projectStructure.accountName === filters.accountName);
    }

    console.log("Returning filtered projects data:", filteredData.length, "items");
    return { data: filteredData };
}

// RESOURCE API
async function fetchResourcesData(filters = {}) {
    console.log("Fetching resources data with filters:", filters);
    await new Promise(resolve => setTimeout(resolve, 200));

    let filteredData = mockResourcesData;

    if (filters.userRole) {
        filteredData = filteredData.filter(item => item.resource.userRole === filters.userRole);
    }

    if (filters.employeeType) {
        filteredData = filteredData.filter(item => item.resource.employeeType === filters.employeeType);
    }

    if (filters.status) {
        filteredData = filteredData.filter(item => item.resource.status === filters.status);
    }

    if (filters.employeeId) {
        filteredData = filteredData.filter(item => item.resource.employeeId === filters.employeeId);
    }

    console.log("Returning filtered resources data:", filteredData.length, "items");
    return { data: filteredData };
}

// BILLING API
async function fetchBillingData(filters = {}) {
    console.log("Fetching billing data with filters:", filters);
    await new Promise(resolve => setTimeout(resolve, 200));

    let filteredData = mockBillingData;

    if (filters.projectPccNumber) {
        filteredData = filteredData.filter(item => item.billing.projectPccNumber === filters.projectPccNumber);
    }

    if (filters.billingStatus) {
        filteredData = filteredData.filter(item => item.billing.billingStatus === filters.billingStatus);
    }

    if (filters.paymentType) {
        filteredData = filteredData.filter(item => item.billing.paymentType === filters.paymentType);
    }

    if (filters.resourceId) {
        filteredData = filteredData.filter(item => item.billing.resourceId === filters.resourceId);
    }

    console.log("Returning filtered billing data:", filteredData.length, "items");
    return { data: filteredData };
}

// LEGACY FUNCTION - kept for backwards compatibility, now fetches projects only
async function fetchMockReportData(filters = {}) {
    return await fetchProjectsData(filters);
}

// UTILITY FUNCTIONS
function getUniqueProjectTypes() {
    return [...new Set(mockProjectsData.map(item => item.projectStructure.projectType))].sort();
}

function getUniqueAccountNames() {
    return [...new Set(mockProjectsData.map(item => item.projectStructure.accountName))].sort();
}

function getUniqueUserRoles() {
    return [...new Set(mockResourcesData.map(item => item.resource.userRole))].sort();
}

function getUniqueEmployeeTypes() {
    return [...new Set(mockResourcesData.map(item => item.resource.employeeType))].sort();
}

function getUniqueResourceStatuses() {
    return [...new Set(mockResourcesData.map(item => item.resource.status))].sort();
}

function getUniqueBillingStatuses() {
    return [...new Set(mockBillingData.map(item => item.billing.billingStatus))].sort();
}

function getUniquePaymentTypes() {
    return [...new Set(mockBillingData.map(item => item.billing.paymentType))].sort();
}