import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { PropertyService } from '../../services/property.service';
import { AuthService } from '../../services/auth.service';
import { Property, User } from '../../models/interfaces';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-properties-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <!-- Hero Section -->
    <div class="hero-section text-center text-light d-flex align-items-center" style="min-height: 45vh; padding-top: 80px; padding-bottom: 60px; background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=1920&q=90') center/cover;">
      <div class="container">
        <h2 class="display-6 fw-bold mb-3 mt-4 animate__animated animate__fadeInUp">Buy, Rent or Sell properties with trusted listings across 500+ cities</h2>
        
        <!-- Persona Toggle Segmented Control -->
        <div class="persona-group animate__animated animate__fadeInUp animate__delay-1s mt-4">
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

    <div class="py-5">
      <div class="container">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h2 class="fw-bold">{{ pageTitle() }}</h2>
          <span class="text-muted">{{ total() }} results found</span>
        </div>
        
        <div class="row g-4">
          <div class="col-md-4" *ngFor="let prop of properties()">
            <div class="card property-card h-100">
              <div class="position-absolute top-0 end-0 p-2 z-index-1 d-flex flex-column align-items-end gap-1">
                <span *ngIf="prop.status === 'sold/rented'" class="badge bg-danger mb-1 shadow">{{ prop.type === 'rent' ? 'RENTED OUT' : 'SOLD OUT' }}</span>
                <div>
                  <span class="badge bg-primary me-1 shadow">{{ prop.type | titlecase }}</span>
                  <span class="badge bg-dark shadow"><i class="bi bi-eye"></i> {{ prop.views }}</span>
                </div>
              </div>
              
              <img [src]="prop.images && prop.images.length > 0 ? apiUrl.replace('/api', '') + prop.images[0] : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=400&q=80'" class="card-img-top" alt="Property Image" style="height: 200px; object-fit: cover;">
              
              <div class="card-body">
                <h5 class="card-title text-truncate fw-bold">{{ prop.title }}</h5>
                <p class="text-primary fw-bold fs-5 mb-2">{{ prop.price | currency:'INR' }}</p>
                <p class="text-muted small mb-3"><i class="bi bi-geo-alt"></i> {{ prop.location }}{{ prop.state ? ', ' + prop.state : '' }}</p>
                
                <div class="d-flex justify-content-between text-muted small mb-3 border-top pt-3">
                  <span><i class="bi bi-house"></i> {{ prop.propertyType }}</span>
                  <span><i class="bi bi-shop"></i> {{ prop.area }} sqft</span>
                  <span *ngIf="prop.bedrooms"><i class="bi bi-door-open"></i> {{ prop.bedrooms }} Bed</span>
                </div>
                
                <div class="d-flex gap-2">
                  <button class="btn btn-outline-primary flex-grow-1" [routerLink]="['/properties', prop.slug]">View Details</button>
                  <button class="btn" [ngClass]="isFavorite(prop._id!) ? 'btn-danger' : 'btn-outline-danger'" (click)="toggleFavorite(prop._id!)">
                    <i class="bi" [ngClass]="isFavorite(prop._id!) ? 'bi-heart-fill' : 'bi-heart'"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="properties().length === 0" class="text-center py-5">
          <h4 class="text-muted">No properties found matching your criteria.</h4>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .text-gradient {background: linear-gradient(135deg, #ff5200, #ffffff, #046a38); ; -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .btn-forest { background: #096a4d; border-color: #096a4d; transition: all 0.4s ease; }
    .btn-forest:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(9, 106, 77, 0.3); }
    .pulse { animation: pulse-green 2s infinite; }
    @keyframes pulse-green { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
    .shimmer { animation: shimmer 2s infinite linear; background: linear-gradient(90deg, #096a4d 0%, #1a8f6d 50%, #096a4d 100%); background-size: 200% 100%; }
  `]
})
export class PropertiesListComponent implements OnInit {
  searchForm!: FormGroup;
  activePersona: 'buy' | 'rent' | 'sell' = 'buy';
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

  properties = signal<Property[]>([]);
  total = signal<number>(0);
  pageTitle = signal<string>('Properties in India');
  apiUrl = environment.apiUrl;
  currentUser = signal<User | null>(null);

  constructor(
    private propertyService: PropertyService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.authService.currentUser.subscribe(u => this.currentUser.set(u));
    this.searchForm = this.fb.group({
      type: [''],
      state: [''],
      location: [''],
      propertyType: ['']
    });
    this.filteredCities = Object.values(this.statesData).flat().sort();
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.updateTitle(params);
      this.loadProperties(params);
    });
  }

  private updateTitle(params: any) {
    const city = params.location;
    const state = params.state;
    if (city && state) {
      this.pageTitle.set(`Properties in ${city}, ${state}`);
    } else if (city) {
      this.pageTitle.set(`Properties in ${city}`);
    } else if (state) {
      this.pageTitle.set(`Properties in ${state}`);
    } else {
      this.pageTitle.set('Properties in India');
    }
  }

  loadProperties(params: any) {
    const queryParams = { ...params, status: 'all' };
    this.propertyService.getProperties(queryParams).subscribe({
      next: (res) => {
        this.properties.set(res.data);
        this.total.set(res.total);
      },
      error: (err) => console.error(err)
    });
  }

  isFavorite(id: string): boolean {
    const userFavs = this.currentUser()?.favorites || [];
    return userFavs.includes(id);
  }

  toggleFavorite(id: string) {
    this.propertyService.toggleFavorite(id).subscribe({
      next: () => {
        // Optimistic UI update locally and persist
        const user = this.currentUser();
        if (user) {
          const favs = user.favorites || [];
          const newFavs = favs.includes(id) ? favs.filter(fid => fid !== id) : [...favs, id];
          this.authService.updateCurrentUser({ favorites: newFavs });
        }
      },
      error: () => alert('Please login to add favorites.')
    });
  }

  onStateChange() {
    this.selectedState = this.searchForm.get('state')?.value;
    if (this.selectedState) {
      this.filteredCities = [...this.statesData[this.selectedState], 'Others'];
      this.searchForm.patchValue({ location: '' });
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
    
    // Instead of raw router.navigate, let's update current queryParams
    this.router.navigate(['/properties'], { queryParams });
  }

  setPersona(persona: 'buy' | 'rent' | 'sell') {
    this.activePersona = persona;
    if (persona === 'buy') this.searchForm.patchValue({ type: 'sale' });
    if (persona === 'rent') this.searchForm.patchValue({ type: 'rent' });
  }
}
