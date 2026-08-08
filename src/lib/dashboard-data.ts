export interface ProductItem {
  id: string;
  name: string;
  brand: string;
  model: string;
  category: 'mobile' | 'computer' | 'electronics' | 'kitchen' | 'furniture' | 'vehicle' | 'appliances';
  categoryLabel: string;
  purchaseDate: string;
  purchasePrice: number;
  retailer: string;
  orderNumber?: string;
  serialNumber: string;
  assetId: string;
  warrantyMonths: number;
  warrantyType: 'Manufacturer' | 'Extended' | 'Store';
  warrantyCoverageName: string;
  warrantyCoverageDesc: string;
  expiryDate: string;
  status: 'active' | 'expiring' | 'expired';
  monthsRemainingText: string;
  daysRemaining: number;
  progressPercent: number;
  image: string;
  invoiceFileName: string;
  serviceHistory: {
    id: string;
    date: string;
    type: string;
    description: string;
    cost: number;
    completed: boolean;
    status?: 'completed' | 'in_progress' | 'scheduled';
    provider?: string;
    isCovered?: boolean;
  }[];
  nearbyServiceCenter?: {
    name: string;
    address: string;
    distance: string;
  };
}

export interface ReminderItem {
  id: string;
  title: string;
  productName: string;
  daysLeft: number;
  expiryDate: string;
  urgency: 'high' | 'medium' | 'low';
}

export interface MetricSummary {
  totalProducts: number;
  activeWarranties: number;
  expiredWarranties: number;
  upcomingServices: number;
  expiringThisMonth: number;
  totalAssetValue: number;
  averageProductAge: number;
  totalServiceSpend: number;
  coveragePercentage: number;
}

// Alias used by realtime-context.tsx
export type DashboardMetrics = MetricSummary;


export const initialProducts: ProductItem[] = [
  {
    id: 'samsung-s26-ultra',
    name: 'Galaxy S26 Ultra',
    brand: 'Samsung',
    model: 'SM-S928B/DS 512GB Titanium',
    category: 'mobile',
    categoryLabel: 'Mobile',
    purchaseDate: '15 Jan 2026',
    purchasePrice: 1299.00,
    retailer: 'Samsung Official Store',
    orderNumber: '#SAM-8893120',
    serialNumber: 'R5CW308X9MA',
    assetId: 'AP-GAL-26',
    warrantyMonths: 24,
    warrantyType: 'Manufacturer',
    warrantyCoverageName: 'Samsung Care+ Protection',
    warrantyCoverageDesc: 'Full hardware coverage & accidental drop protection',
    expiryDate: '15 Jan 2028',
    status: 'active',
    monthsRemainingText: '18 Months Left',
    daysRemaining: 540,
    progressPercent: 75,
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&auto=format&fit=crop&q=80',
    invoiceFileName: 'Samsung_Galaxy_Invoice_2026.pdf',
    serviceHistory: [
      {
        id: 'srv-sam-1',
        date: 'Nov 02, 2023',
        type: 'Battery Check',
        description: 'Comprehensive diagnostic battery health assessment and firmware update.',
        cost: 45.00,
        completed: true,
        status: 'completed',
        provider: 'Samsung Plaza • Maintenance',
        isCovered: false
      }
    ],
    nearbyServiceCenter: {
      name: 'Samsung Experience Center - Midtown',
      address: '767 5th Ave, New York, NY',
      distance: '0.8 miles away'
    }
  },
  {
    id: 'macbook-pro-m3',
    name: 'MacBook Pro M3 Max',
    brand: 'Apple',
    model: '16-inch, Nov 2023 • Model A2991',
    category: 'computer',
    categoryLabel: 'Computer',
    purchaseDate: '10 Nov 2023',
    purchasePrice: 2499.00,
    retailer: 'Apple Store, 5th Avenue',
    orderNumber: '#W892348100',
    serialNumber: 'C02XG8H7MD6R',
    assetId: 'AP-MBP-991',
    warrantyMonths: 24,
    warrantyType: 'Manufacturer',
    warrantyCoverageName: 'AppleCare+ (Manufacturer)',
    warrantyCoverageDesc: 'Accidental damage & hardware coverage with priority 24/7 tech support',
    expiryDate: '11 Nov 2025',
    status: 'active',
    monthsRemainingText: '8 Months Left',
    daysRemaining: 245,
    progressPercent: 65,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
    invoiceFileName: 'Apple_Store_MBP_Invoice.pdf',
    serviceHistory: [
      {
        id: 'srv-mac-1',
        date: 'Oct 24, 2023',
        type: 'Screen Replacement',
        description: 'Replaced Liquid Retina XDR display panel under AppleCare+ coverage.',
        cost: 0.00,
        completed: true,
        status: 'completed',
        provider: 'Apple Store • Warranty Claim',
        isCovered: true
      }
    ],
    nearbyServiceCenter: {
      name: 'Apple Genius Bar - 5th Ave',
      address: '767 5th Ave, New York, NY 10153',
      distance: '1.2 miles away'
    }
  },
  {
    id: 'sony-bravia-xr',
    name: 'Bravia XR OLED 65"',
    brand: 'Sony',
    model: 'XR-65A95L Master Series',
    category: 'electronics',
    categoryLabel: 'Electronics',
    purchaseDate: '05 Mar 2024',
    purchasePrice: 2199.00,
    retailer: 'Best Buy Midtown',
    orderNumber: '#BBY-0921-998',
    serialNumber: 'SN-SONY-99824X',
    assetId: 'AP-SNY-65OLED',
    warrantyMonths: 24,
    warrantyType: 'Store',
    warrantyCoverageName: 'Geek Squad Total Protection',
    warrantyCoverageDesc: 'Zero pixel defect guarantee & panel replacement warranty',
    expiryDate: '05 Mar 2026',
    status: 'expiring',
    monthsRemainingText: '2 Months Left',
    daysRemaining: 60,
    progressPercent: 20,
    image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600&auto=format&fit=crop&q=80',
    invoiceFileName: 'Sony_Bravia_BestBuy_Receipt.pdf',
    serviceHistory: [],
    nearbyServiceCenter: {
      name: 'Sony Authorized Service - Manhattan',
      address: '550 Madison Ave, New York, NY',
      distance: '2.1 miles away'
    }
  },
  {
    id: 'lg-instaview-fridge',
    name: 'LG InstaView Door-in-Door Refrigerator',
    brand: 'LG',
    model: 'LRMVS3006S Smart Wi-Fi 30 cu. ft.',
    category: 'appliances',
    categoryLabel: 'Home Appliance',
    purchaseDate: '12 Jan 2024',
    purchasePrice: 2899.00,
    retailer: 'The Home Depot',
    orderNumber: '#HD-283910-A',
    serialNumber: 'LG-REF-893021',
    assetId: 'AP-LG-REF',
    warrantyMonths: 36,
    warrantyType: 'Manufacturer',
    warrantyCoverageName: 'LG Linear Compressor 10-Yr Extended',
    warrantyCoverageDesc: 'Full compressor & internal refrigeration mechanics warranty',
    expiryDate: '12 Jan 2027',
    status: 'active',
    monthsRemainingText: '11 Months Left',
    daysRemaining: 340,
    progressPercent: 82,
    image: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=600&auto=format&fit=crop&q=80',
    invoiceFileName: 'LG_Refrigerator_HomeDepot_Receipt.pdf',
    serviceHistory: [
      {
        id: 'srv-lg-1',
        date: 'Nov 18, 2023',
        type: 'Gas Refill',
        description: 'Refrigerant R600a replenishment and condenser coil vacuum cleaning.',
        cost: 120.00,
        completed: false,
        status: 'in_progress',
        provider: 'Home Service • Repair',
        isCovered: false
      }
    ],
    nearbyServiceCenter: {
      name: 'LG Appliance Care Center',
      address: '142 W 34th St, New York, NY',
      distance: '1.5 miles away'
    }
  },
  {
    id: 'tesla-model-3',
    name: 'Tesla Model 3 Long Range',
    brand: 'Tesla',
    model: 'Dual Motor AWD 2024 Refresh',
    category: 'vehicle',
    categoryLabel: 'Vehicles',
    purchaseDate: '15 Mar 2024',
    purchasePrice: 47990.00,
    retailer: 'Tesla Direct Manhattan',
    orderNumber: '#TSLA-992104',
    serialNumber: '5YJ3E1EB8NF829104',
    assetId: 'AP-TSLA-M3',
    warrantyMonths: 48,
    warrantyType: 'Manufacturer',
    warrantyCoverageName: 'Tesla 4-Year / 50k Bumper-to-Bumper',
    warrantyCoverageDesc: 'Full high-voltage battery, drive unit, and electronics coverage.',
    expiryDate: '15 Mar 2028',
    status: 'active',
    monthsRemainingText: '24 Months Left',
    daysRemaining: 730,
    progressPercent: 78,
    image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=600&auto=format&fit=crop&q=80',
    invoiceFileName: 'Tesla_Model3_Invoice_2024.pdf',
    serviceHistory: [
      {
        id: 'srv-tsla-1',
        date: 'Dec 01, 2023',
        type: 'Annual Inspection',
        description: 'Brake fluid test, HEPA cabin filter swap, and multi-point telemetry check.',
        cost: 180.00,
        completed: false,
        status: 'scheduled',
        provider: 'Tesla Service Ctr • AMC',
        isCovered: false
      },
      {
        id: 'srv-tsla-2',
        date: '10 Aug 2023',
        type: 'Tire Rotation & Balance',
        description: 'Even wear tire rotation, dynamic wheel balancing, and tire pressure sensor check.',
        cost: 65.00,
        completed: true,
        status: 'completed',
        provider: 'Tesla Mobile Service',
        isCovered: false
      },
      {
        id: 'srv-tsla-3',
        date: '04 Jun 2023',
        type: 'Windshield Wiper Motor Calibration',
        description: 'Replaced wiper motor linkage assembly covered under OEM warranty.',
        cost: 0.00,
        completed: true,
        status: 'completed',
        provider: 'Tesla Service Manhattan',
        isCovered: true
      },
      {
        id: 'srv-tsla-4',
        date: '18 Jan 2023',
        type: 'HVAC Air Filter Replacement',
        description: 'Bio-weapon defense HEPA filter upgrade and AC coil sanitizer treatment.',
        cost: 95.00,
        completed: true,
        status: 'completed',
        provider: 'Tesla Service Queens',
        isCovered: false
      },
      {
        id: 'srv-tsla-5',
        date: '12 Sep 2022',
        type: '12V Low Voltage Battery Replacement',
        description: 'Installed upgraded lithium-ion 12V auxiliary battery unit.',
        cost: 140.00,
        completed: true,
        status: 'completed',
        provider: 'Tesla Mobile Service',
        isCovered: false
      },
      {
        id: 'srv-tsla-6',
        date: '05 Mar 2022',
        type: 'Wheel Alignment & Suspension Tuning',
        description: 'Laser alignment for front and rear control arms after pothole impact.',
        cost: 210.00,
        completed: true,
        status: 'completed',
        provider: 'Tesla Service Midtown',
        isCovered: false
      }
    ],
    nearbyServiceCenter: {
      name: 'Tesla Service Manhattan',
      address: '511 W 25th St, New York, NY',
      distance: '0.6 miles away'
    }
  },
  {
    id: 'dyson-v15-detect',
    name: 'Dyson V15 Detect Vacuum',
    brand: 'Dyson',
    model: 'SV22 Total Clean Cordless',
    category: 'appliances',
    categoryLabel: 'Home Appliance',
    purchaseDate: '18 Apr 2024',
    purchasePrice: 749.00,
    retailer: 'Dyson Demo Store',
    orderNumber: '#DYS-839029',
    serialNumber: 'SV22-US-NKA4928',
    assetId: 'AP-DYS-V15',
    warrantyMonths: 24,
    warrantyType: 'Manufacturer',
    warrantyCoverageName: 'Dyson 2-Year Direct Guarantee',
    warrantyCoverageDesc: 'Free genuine parts & battery replacement',
    expiryDate: '18 Apr 2026',
    status: 'expiring',
    monthsRemainingText: '25 Days Left',
    daysRemaining: 25,
    progressPercent: 12,
    image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600&auto=format&fit=crop&q=80',
    invoiceFileName: 'Dyson_Official_Receipt.pdf',
    serviceHistory: [
      {
        id: 'srv-dys-1',
        date: '15 Jan 2024',
        type: 'Laser Fluffy Head Brush Replacement',
        description: 'Replaced brush bar head with built-in dirt detector sensor under manufacturer warranty.',
        cost: 0.00,
        completed: true,
        status: 'completed',
        provider: 'Dyson Demo Store Service',
        isCovered: true
      },
      {
        id: 'srv-dys-2',
        date: '28 Jul 2023',
        type: 'HEPA Filter Deep Wash & Purge',
        description: 'Ultrasonic filter cleaning and motor intake inspection.',
        cost: 35.00,
        completed: true,
        status: 'completed',
        provider: 'Authorized Tech Hub',
        isCovered: false
      }
    ],
    nearbyServiceCenter: {
      name: 'Dyson Demo Store & Repair Hub',
      address: '640 5th Ave, New York, NY',
      distance: '1.1 miles away'
    }
  },
  {
    id: 'sony-wh1000xm5',
    name: 'Sony WH-1000XM5 Headphones',
    brand: 'Sony',
    model: 'Noise-Canceling Wireless ANC',
    category: 'electronics',
    categoryLabel: 'Electronics',
    purchaseDate: '22 Aug 2024',
    purchasePrice: 399.00,
    retailer: 'Amazon US',
    orderNumber: '#114-8930219-938',
    serialNumber: 'S01-8392019-B',
    assetId: 'AP-SNY-WH5',
    warrantyMonths: 12,
    warrantyType: 'Manufacturer',
    warrantyCoverageName: 'Sony 1-Year Limited Warranty',
    warrantyCoverageDesc: 'Driver & Bluetooth module manufacturer warranty',
    expiryDate: '22 Aug 2025',
    status: 'expiring',
    monthsRemainingText: '12 Days Left',
    daysRemaining: 12,
    progressPercent: 5,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    invoiceFileName: 'Amazon_Sony_Headphones_Invoice.pdf',
    serviceHistory: [
      {
        id: 'srv-sny-1',
        date: '02 Feb 2024',
        type: 'Ear Cushion & Headband Replacement',
        description: 'Upgraded soft leatherette ear pads replacement.',
        cost: 45.00,
        completed: true,
        status: 'completed',
        provider: 'Sony Authorized Center',
        isCovered: false
      }
    ],
    nearbyServiceCenter: {
      name: 'Sony Service Point',
      address: '550 Madison Ave, New York, NY',
      distance: '2.1 miles away'
    }
  },
  {
    id: 'bosch-dishwasher',
    name: 'Bosch 800 Series Dishwasher',
    brand: 'Bosch',
    model: 'SHX78B75UC 24" Custom Panel',
    category: 'appliances',
    categoryLabel: 'Home Appliance',
    purchaseDate: '10 May 2022',
    purchasePrice: 1150.00,
    retailer: 'Lowe\'s Home Improvement',
    orderNumber: '#LOW-892301',
    serialNumber: 'SMV8YCX01G/01',
    assetId: 'AP-BSH-800',
    warrantyMonths: 24,
    warrantyType: 'Manufacturer',
    warrantyCoverageName: 'Bosch Standard Limited 2-Yr',
    warrantyCoverageDesc: 'Standard electronics & pump coverage',
    expiryDate: '10 May 2024',
    status: 'expired',
    monthsRemainingText: 'Ended',
    daysRemaining: 0,
    progressPercent: 0,
    image: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=600&auto=format&fit=crop&q=80',
    invoiceFileName: 'Bosch_Lowes_Invoice_2022.pdf',
    serviceHistory: [
      {
        id: 'srv-3',
        date: '12 Oct 2023',
        type: 'Drain Pump Cleanout',
        description: 'Cleared minor blockage in circulation pump.',
        cost: 0.00,
        completed: true,
        status: 'completed',
        provider: 'Bosch Certified Service',
        isCovered: true
      },
      {
        id: 'srv-4',
        date: '18 Apr 2023',
        type: 'Door Seal Gasket Replacement',
        description: 'Installed new leak-proof silicone door seal.',
        cost: 85.00,
        completed: true,
        status: 'completed',
        provider: 'Lowe\'s Installation Team',
        isCovered: false
      }
    ],
    nearbyServiceCenter: {
      name: 'Bosch Certified Service Team',
      address: '1100 6th Ave, New York, NY',
      distance: '1.9 miles away'
    }
  }
];

export const initialReminders: ReminderItem[] = [
  {
    id: 'rem-1',
    title: 'Sony Headphones Expiring Soon',
    productName: 'Sony WH-1000XM5 Headphones',
    daysLeft: 12,
    expiryDate: '22 Aug 2025',
    urgency: 'high'
  },
  {
    id: 'rem-2',
    title: 'Dyson Vacuum Warranty Expiration',
    productName: 'Dyson V15 Detect Vacuum',
    daysLeft: 25,
    expiryDate: '18 Apr 2026',
    urgency: 'medium'
  },
  {
    id: 'rem-3',
    title: 'Bravia XR OLED Protection Plan',
    productName: 'Bravia XR OLED 65"',
    daysLeft: 60,
    expiryDate: '05 Mar 2026',
    urgency: 'low'
  }
];

export const initialMetrics: MetricSummary = {
  totalProducts: 25,
  activeWarranties: 18,
  expiredWarranties: 7,
  upcomingServices: 4,
  expiringThisMonth: 3,
  totalAssetValue: 12450,
  averageProductAge: 1.8,
  totalServiceSpend: 340,
  coveragePercentage: 72
};
