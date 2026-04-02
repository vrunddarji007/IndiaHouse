import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { PropertyService } from '../../services/property.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <!-- Hero Section -->
    <div class="hero-section text-center text-light d-flex align-items-center" style="min-height: 85vh; padding-top: 80px; background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=1920&q=90') center/cover;">
      <div class="container">
        <h1 class="display-3 fw-bold mb-3 mt-4 animate__animated animate__fadeInUp">Find Your Perfect Place in <span class="text-primary text-gradient">India</span></h1>
        <p class="lead mb-4 animate__animated animate__fadeInUp animate__delay-1s opacity-75">Buy, Rent or Sell properties with trusted listings across 500+ cities</p>
        
        <!-- Persona Toggle Segmented Control -->
        <div class="persona-group animate__animated animate__fadeInUp animate__delay-1s">
          <button class="persona-btn" [class.active]="activePersona === 'buy'" (click)="setPersona('buy')">Buy</button>
          <button class="persona-btn" [class.active]="activePersona === 'rent'" (click)="setPersona('rent')">Rent</button>
          <button class="persona-btn" [class.active]="activePersona === 'sell'" (click)="setPersona('sell')">Sell</button>
        </div>

        <!-- Search Form Card (Conditional based on Persona) -->
        <div class="bg-glass-light p-4 mx-auto text-start shadow-2-strong animate__animated animate__zoomIn" style="max-width: 1100px; border-radius: 24px;">
          
          <!-- BUY / RENT FORM -->
          <form *ngIf="activePersona !== 'sell'" [formGroup]="searchForm" (ngSubmit)="onSearch()">
            <div class="row g-3">
              <div class="col-md-3">
                <div class="form-floating">
                  <select class="form-select border-0" id="stateSelect" formControlName="state" (change)="onStateChange()">
                    <option value="">All over India</option>
                    <option *ngFor="let s of states" [value]="s">{{ s }}</option>
                  </select>
                  <label for="stateSelect" class="text-muted small">State</label>
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-floating">
                  <select class="form-select border-0" id="citySelect" formControlName="location">
                    <option value="">{{ selectedState ? 'Select City' : 'Major Cities' }}</option>
                    <option *ngFor="let c of filteredCities" [value]="c">{{ c }}</option>
                  </select>
                  <label for="citySelect" class="text-muted small">City/Locality</label>
                </div>
              </div>
              <div class="col-md-3">
                 <div class="form-floating">
                  <select class="form-select border-0" id="propSelect" formControlName="propertyType">
                    <option value="">Any Category</option>
                    <option *ngFor="let p of propertyTypes" [value]="p">{{ p }}</option>
                  </select>
                  <label for="propSelect" class="text-muted small">Property Type</label>
                </div>
              </div>
              <div class="col-md-3 d-flex align-items-center justify-content-center">
                <button type="submit" class="btn btn-forest w-100 h-100 py-3 fw-bold text-white shadow-sm shimmer rounded-4">
                  <i class="bi bi-search me-2"></i> Search Properties
                </button>
              </div>
            </div>
          </form>

          <!-- SELL FORM (Lead Generation) -->
           <div *ngIf="activePersona === 'sell'" class="row align-items-center py-2 px-3">
              <div class="col-md-8">
                <h4 class="mb-1 text-dark fw-bold">Post your Property for <span class="text-success pulse">FREE</span></h4>
                <p class="text-muted mb-0 small">Get contacted by thousands of verified buyers and tenants directly.</p>
              </div>
              <div class="col-md-4 text-end">
                  <a routerLink="/properties/post" class="btn btn-forest px-5 py-3 fw-bold text-white btn-glow hover-lift rounded-4">
                    <i class="bi bi-megaphone-fill me-2"></i> List Property Now
                  </a>
              </div>
           </div>

        </div>
      </div>
    </div>

    <!-- Features / Trust Signals Section -->
    <div class="container-fluid bg-white py-5 shadow-sm">
      <div class="container">
        <div class="row text-center g-4">
          <div class="col-md-4">
            <div class="p-3">
              <i class="bi bi-shield-check fs-1 text-forest mb-3 d-block"></i>
              <h5 class="fw-bold">Verified Listings</h5>
              <p class="text-muted small">Every property is manually checked for authenticity.</p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="p-3">
              <i class="bi bi-person-badge fs-1 text-forest mb-3 d-block"></i>
              <h5 class="fw-bold">RERA Approved</h5>
              <p class="text-muted small">Only licensed builders and certified projects.</p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="p-3">
              <i class="bi bi-hand-thumbs-up fs-1 text-forest mb-3 d-block"></i>
              <h5 class="fw-bold">Expert Guidance</h5>
              <p class="text-muted small">Free consultation for first-time home buyers.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Popular Areas -->
    <div class="container py-5">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="fw-bold mb-0">Trending Cities</h2>
        <a routerLink="/properties" class="text-forest fw-bold text-decoration-none hvr-forward">View All <i class="bi bi-arrow-right"></i></a>
      </div>
      <div class="row g-4">
        <div class="col-md-4" *ngFor="let area of trendingCities">
          <div class="card bg-dark text-white border-0 area-card cursor-pointer" (click)="searchArea(area.name)">
            <img [src]="area.img" class="card-img" [alt]="area.name">
            <div class="card-img-overlay d-flex flex-column justify-content-end p-4">
              <h3 class="card-title fw-bold mb-0">{{ area.name }}</h3>
              <p class="small mb-0 opacity-75">{{ area.count }} Properties</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .text-gradient { background: linear-gradient(135deg, #ff5200, #ffffff, #046a38); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .btn-forest { background: #096a4d; border-color: #096a4d; transition: all 0.4s ease; }
    .btn-forest:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(9, 106, 77, 0.3); }
    .area-card { height: 320px; border-radius: 20px !important; overflow: hidden; }
    .area-card img { height: 100%; object-fit: cover; transition: transform 0.8s ease; }
    .area-card:hover img { transform: scale(1.1); }
    .hvr-forward:hover i { transform: translateX(5px); }
    .pulse { animation: pulse-green 2s infinite; }
    @keyframes pulse-green { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
    .shimmer { animation: shimmer 2s infinite linear; background: linear-gradient(90deg, #096a4d 0%, #1a8f6d 50%, #096a4d 100%); background-size: 200% 100%; }
  `]
})
export class HomeComponent implements OnInit {
  searchForm: FormGroup;
  activePersona: 'buy' | 'rent' | 'sell' = 'buy';
  
  trendingCities = [
    { name: 'Mumbai', img: 'mumbai.png', count: '12k+' },
    { name: 'Delhi', img: 'Delhi.png', count: '8k+' },
    { name: 'Bengaluru', img: 'bengaluru.png', count: '15k+' }
  ];

  statesData: { [key: string]: string[] } = {
    "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Tirupati", "Rajamahendravaram", "Kakinada"],
    "Arunachal Pradesh": ["Itanagar", "Tawang", "Pasighat", "Ziro", "Roing", "Naharlagun", "Bomdila"],
    "Assam": ["Guwahati", "Dibrugarh", "Silchar", "Jorhat", "Nagaon", "Tinsukia", "Bongaigaon"],
    "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia", "Darbhanga", "Arrah", "Begusarai", "Hajipur"],
    "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba", "Durg", "Jagdalpur", "Ambikapur", "Rajnandgaon"],
    "Goa": ["Panaji", "Vasco da Gama", "Margao", "Mapusa", "Ponda", "Bicholim"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Junagadh", "Anand", "Vapi"],
    "Haryana": ["Chandigarh", "Gurugram (Gurgaon)", "Faridabad", "Panipat", "Ambala", "Yamunanagar", "Rohtak", "Hisar", "Karnal"],
    "Himachal Pradesh": ["Shimla", "Dharamshala", "Solan", "Mandi", "Kullu", "Manali", "Bilaspur", "Chamba", "Hamirpur"],
    "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro Steel City", "Deoghar", "Phusro", "Hazaribagh", "Giridih"],
    "Karnataka": ["Bengaluru", "Mysuru (Mysore)", "Hubballi-Dharwad", "Mangaluru", "Belagavi", "Kalaburagi", "Ballari", "Vijayapura"],
    "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Kollam", "Thrissur", "Alappuzha", "Palakkad", "Malappuram", "Kannur"],
    "Madhya Pradesh": ["Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Dewas", "Satna", "Ratlam", "Rewa"],
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Pimpri-Chinchwad", "Nashik", "Kalyan-Dombivli", "Vasai-Virar", "Aurangabad"],
    "Manipur": ["Imphal", "Churachandpur", "Thoubal", "Kakching", "Ukhrul"],
    "Meghalaya": ["Shillong", "Tura", "Jowai", "Nongstoin", "Williamnagar"],
    "Mizoram": ["Aizawl", "Lunglei", "Saiha", "Champhai", "Kolasib"],
    "Nagaland": ["Kohima", "Dimapur", "Mokokchung", "Tuensang", "Wokha", "Zunheboto"],
    "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Puri", "Balasore", "Bhadrak"],
    "Punjab": ["Chandigarh", "Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Hoshiarpur", "Pathankot"],
    "Rajasthan": ["Jaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer", "Udaipur", "Bhilwara", "Alwar", "Sikar", "Pali"],
    "Sikkim": ["Gangtok", "Namchi", "Geyzing", "Mangan", "Rangpo"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tiruppur", "Erode", "Vellore", "Thoothukudi"],
    "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Khammam", "Karimnagar", "Ramagundam", "Mahbubnagar"],
    "Tripura": ["Agartala", "Dharmanagar", "Udaipur", "Kailasahar", "Bishalgarh"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Ghaziabad", "Agra", "Meerut", "Varanasi", "Prayagraj", "Bareilly", "Aligarh", "Noida"],
    "Uttarakhand": ["Dehradun", "Haridwar", "Roorkee", "Haldwani", "Rudrapur", "Kashipur", "Rishikesh"],
    "West Bengal": ["Kolkata", "Howrah", "Asansol", "Siliguri", "Durgapur", "Bardhaman", "Malda", "Baharampur", "Kharagpur"],
    "Andaman & Nicobar": ["Sri Vijaya Puram", "Diglipur", "Mayabunder", "Bamboo Flat"],
    "Chandigarh": ["Chandigarh"],
    "Dadra & Nagar Haveli and Daman & Diu": ["Daman", "Silvassa", "Diu"],
    "Delhi (NCT)": ["New Delhi", "Delhi", "Najafgarh", "Narela"],
    "Jammu & Kashmir": ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Udhampur", "Kathua", "Sopore"],
    "Ladakh": ["Leh", "Kargil"],
    "Lakshadweep": ["Kavaratti", "Agatti", "Minicoy", "Amini"],
    "Puducherry": ["Puducherry", "Karaikal", "Mahe", "Yanam"],
    "Others": ["Others"]
  };
  
  states = Object.keys(this.statesData);
  filteredCities: string[] = [];
  selectedState = '';
  propertyTypes = ["Flat","Row House","Bungalow","Plot","Commercial","Penthouse"];

  constructor(private fb: FormBuilder, private router: Router) {
    this.searchForm = this.fb.group({
      type: [''],
      state: [''],
      location: [''],
      propertyType: ['']
    });

    // Populate all cities initially for broad search
    this.filteredCities = Object.values(this.statesData).flat().sort();
  }

  ngOnInit(): void {}

  onStateChange() {
    this.selectedState = this.searchForm.get('state')?.value;
    if (this.selectedState) {
      this.filteredCities = [...this.statesData[this.selectedState], 'Others'];
      this.searchForm.patchValue({ location: '' }); // Reset city when state changes
    } else {
      this.filteredCities = [...Object.values(this.statesData).flat(), 'Others'].sort();
    }
  }

  onSearch() {
    const queryParams: any = {};
    const formVals = this.searchForm.value;
    queryParams.type = this.activePersona === 'rent' ? 'rent' : 'sale';
    if (formVals.state) queryParams.state = formVals.state;
    if (formVals.location) queryParams.location = formVals.location;
    if (formVals.propertyType) queryParams.propertyType = formVals.propertyType;
    
    this.router.navigate(['/properties'], { queryParams });
  }

  setPersona(persona: 'buy' | 'rent' | 'sell') {
    this.activePersona = persona;
    if (persona === 'buy') this.searchForm.patchValue({ type: 'sale' });
    if (persona === 'rent') this.searchForm.patchValue({ type: 'rent' });
  }

  searchArea(area: string) {
    this.router.navigate(['/properties'], { queryParams: { location: area } });
  }
}
