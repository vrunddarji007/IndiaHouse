import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PropertyService } from '../../services/property.service';
import { ToastService } from '../../services/toast.service';
import { Map, tileLayer, marker, icon, Marker } from 'leaflet';

@Component({
  selector: 'app-post-property',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container py-5 mt-4">
      <div class="card border-0 shadow-lg mx-auto" style="max-width: 800px;">
        <div class="card-header bg-primary text-center py-4">
          <h2 class="mb-0 fw-bold" style="color: #000 !important;">Post a Property</h2>
        </div>
        <div class="card-body p-4 p-md-5">
          <form [formGroup]="propertyForm" (ngSubmit)="onSubmit()">
            
            <h4 class="text-primary mb-3">Basic Information</h4>
            <div class="row g-3 mb-4">
              <div class="col-md-6">
                <label class="form-label">Are you listing for?</label>
                <select class="form-select" formControlName="type">
                  <option value="sale">Sale</option>
                  <option value="rent">Rent</option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label">Property Type</label>
                <select class="form-select" formControlName="propertyType">
                  <option *ngFor="let pType of propertyTypes" [value]="pType">{{ pType }}</option>
                </select>
              </div>
            </div>

            <div class="mb-4">
              <label class="form-label">Property Title*</label>
              <input type="text" class="form-control" formControlName="title" placeholder="e.g. 2BHK Flat in Mumbai">
            </div>

            <div class="mb-4">
              <label class="form-label">Description*</label>
              <textarea class="form-control" formControlName="description" rows="4" placeholder="Describe the property..."></textarea>
            </div>
            
            <div class="d-flex justify-content-between align-items-center mb-3 mt-5">
              <h4 class="text-primary mb-0">Property Details</h4>
              <button type="button" class="btn btn-forest btn-sm text-white shadow-sm" (click)="getCurrentLocation()" [disabled]="locating">
                <i class="bi bi-geo-alt-fill me-1"></i>
                {{ locating ? 'Locating...' : '📍 Use My Live Location' }}
              </button>
            </div>
            
            <div class="row g-3 mb-4">
              <!-- Live Location Map & Note -->
              <div class="d-flex justify-content-between align-items-center mb-0 position-relative w-100">
                <h6 class="text-primary mb-0">Property Location (GPS)*</h6>
                
                <!-- Search Slider Container -->
                <div class="d-flex align-items-center position-relative" style="height: 45px; z-index: 5;">
                  
                  <!-- The Slide-out Search Bar -->
                  <div class="search-bar-slider" [class.open]="showSearchMap">
                    <div class="input-group h-100 w-100 search-input-pill">
                      <span class="input-group-text bg-white border-0 ps-3 pe-2"><i class="bi bi-geo-alt text-muted"></i></span>
                      <input type="text" class="form-control border-0 px-1" style="box-shadow: none;" placeholder="Search any location..." #mapSearchInput (keyup.enter)="searchMapLocation(mapSearchInput.value)">
                      <button class="btn btn-forest px-3 text-white border-0" type="button" (click)="searchMapLocation(mapSearchInput.value)" [disabled]="isSearchingLocation">
                        <span *ngIf="isSearchingLocation" class="spinner-border spinner-border-sm me-1"></span>
                        <span *ngIf="!isSearchingLocation">Search</span>
                      </button>
                    </div>
                  </div>

                  <!-- The Trigger Button -->
                  <button type="button" class="btn btn-white rounded-circle shadow-sm border search-trigger-btn" (click)="showSearchMap = !showSearchMap" title="Toggle Map Search">
                    <i class="bi fs-6 text-dark" [class.bi-search]="!showSearchMap" [class.bi-x-lg]="showSearchMap"></i>
                  </button>
                </div>
              </div>

              <div class="col-12 mb-2">
                <div class="alert alert-warning py-2 mb-3 mt-2">
                  <small class="fw-medium d-block" style="line-height: 1.4;">
                    <i class="bi bi-exclamation-triangle-fill me-1"></i>
                    <strong>Note:</strong> Please share your live location while standing at the property site to ensure accurate verification and assessment of the property location.
                    <br><span class="text-muted ms-3">(संपत्ति स्थल पर खड़े रहते हुए कृपया अपनी लाइव लोकेशन साझा करें ताकि संपत्ति के स्थान का सटीक सत्यापन और मूल्यांकन सुनिश्चित किया जा सके।)</span>
                  </small>
                </div>

                <div id="postMap" class="rounded-4 border shadow-sm mb-2" style="height: 350px; z-index: 1;"></div>
                <div class="form-text text-muted" *ngIf="propertyForm.get('lat')?.value">
                  <i class="bi bi-crosshair me-1"></i> GPS Captured: {{ propertyForm.get('lat')?.value | number:'1.4-4' }}, {{ propertyForm.get('lng')?.value | number:'1.4-4' }}
                  <span *ngIf="geoLoading" class="ms-2 text-primary"><span class="spinner-border spinner-border-sm"></span> Detecting location...</span>
                </div>
              </div>
              <div class="col-md-6">
                <label class="form-label text-muted fw-bold small">State*</label>
                <select class="form-select border bg-light" formControlName="state" (change)="onStateChange()">
                  <option value="">Select State</option>
                  <option *ngFor="let s of states" [value]="s">{{ s }}</option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label text-muted fw-bold small">City*</label>
                <div *ngIf="propertyForm.get('location')?.value !== 'Others'">
                  <select class="form-select border bg-light" formControlName="location">
                    <option value="">{{ selectedState ? 'Select City' : 'Select State first' }}</option>
                    <option *ngFor="let city of filteredCities" [value]="city">{{ city }}</option>
                  </select>
                </div>
                <!-- Custom City Input if "Others" selected -->
                <div *ngIf="propertyForm.get('location')?.value === 'Others'" class="input-group">
                  <input type="text" class="form-control border bg-light" placeholder="Type city name..." #customPropCity (blur)="propertyForm.patchValue({location: customPropCity.value})">
                  <button type="button" class="btn btn-outline-secondary btn-sm" (click)="propertyForm.patchValue({location: ''})">✕</button>
                </div>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label text-muted fw-bold small uppercase">Town</label>
                <div class="input-group">
                  <span class="input-group-text bg-light border" *ngIf="geoLoading"><span class="spinner-border spinner-border-sm text-primary"></span></span>
                  <input type="text" class="form-control border bg-light" formControlName="town" placeholder="Auto-detected from GPS or type manually">
                </div>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label text-muted fw-bold small uppercase">Village</label>
                <div class="input-group">
                  <span class="input-group-text bg-light border" *ngIf="geoLoading"><span class="spinner-border spinner-border-sm text-primary"></span></span>
                  <input type="text" class="form-control border bg-light" formControlName="village" placeholder="Auto-detected from GPS or type manually">
                </div>
              </div>
              <div class="col-12" *ngIf="geoDetected">
                <div class="alert alert-success py-2 mb-0 small d-flex align-items-center gap-2">
                  <i class="bi bi-check-circle-fill"></i>
                  <span><strong>Auto-detected:</strong> {{ geoDetected }}</span>
                </div>
              </div>
              <div class="col-md-6">
                <label class="form-label">Address (Street, Area etc.)*</label>
                <textarea class="form-control" formControlName="address" rows="1" placeholder="e.g. 101, Sunshine Apartments, MG Road..."></textarea>
              </div>
              <div class="col-md-6">
                <label class="form-label">Price (₹)*</label>
                <input type="number" class="form-control" formControlName="price" placeholder="e.g. 5000000">
              </div>
              <div class="col-md-4">
                <label class="form-label">Area (sq.ft)*</label>
                <input type="number" class="form-control" formControlName="area" placeholder="e.g. 1200">
              </div>
              <div class="col-md-4" *ngIf="showRooms()">
                <label class="form-label">Bedrooms*</label>
                <input type="number" class="form-control" formControlName="bedrooms" placeholder="e.g. 2">
              </div>
              <div class="col-md-4" *ngIf="showRooms()">
                <label class="form-label">Bathrooms*</label>
                <input type="number" class="form-control" formControlName="bathrooms" placeholder="e.g. 2">
              </div>
              <div class="col-md-4" *ngIf="propertyForm.get('propertyType')?.value !== 'Plot'">
                <label class="form-label">Furnishing*</label>
                <select class="form-select" formControlName="furnishing">
                  <option value="Unfurnished">Unfurnished</option>
                  <option value="Semi">Semi-Furnished</option>
                  <option value="Furnished">Fully Furnished</option>
                </select>
              </div>


            </div>
              
            <h4 class="text-primary mb-3 mt-5">Images</h4>
            <div class="mb-4">
              <label class="form-label d-block text-muted fw-bold small">Upload Images* (Minimum 1, Max 30, Currently: {{ images.length }})</label>
              <div class="upload-zone p-4 border-dashed rounded-4 text-center bg-light cursor-pointer" (click)="fileInput.click()">
                <i class="bi bi-cloud-arrow-up fs-1 text-primary mb-2"></i>
                <p class="mb-1 fw-bold">Click to upload or drag and drop</p>
                <p class="text-muted small">JPG, JPEG, PNG only. Max 5MB per image.</p>
                <div class="mt-2" *ngIf="images.length > 0">
                  <span class="badge bg-forest px-3 py-2 rounded-pill">{{ images.length }} Files Ready</span>
                </div>
              </div>
              <input type="file" #fileInput class="d-none" (change)="onFileChange($event)" multiple accept="image/*">
            </div>

            <!-- Preview Images -->
            <div class="row g-2 mb-4" *ngIf="previews.length > 0">
              <div class="col-3 position-relative" *ngFor="let p of previews; let i = index">
                <img [src]="p.url" class="img-fluid rounded border" [class.border-danger]="!p.isValid" [class.border-4]="!p.isValid" alt="preview">
                <div *ngIf="!p.isValid" class="text-danger small mt-1" style="font-size: 0.7rem;">Too Large (>5MB)</div>
                <button type="button" class="btn btn-sm btn-danger position-absolute top-0 end-0 m-1" (click)="removeImage(i)">&times;</button>
              </div>
            </div>

            <div class="form-text text-danger mb-3" *ngIf="error">{{ error }}</div>

            <div class="d-grid mt-5">
              <button type="submit" class="btn btn-primary btn-lg" [disabled]="propertyForm.invalid || loading || hasInvalidImages() || images.length === 0">
                <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
                {{ loading ? 'Posting...' : 'Post Property' }}
              </button>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .btn-forest { background: #096a4d; border-color: #096a4d; }
    .btn-forest:hover { opacity: 0.9; transform: translateY(-1px); }
    .border-dashed { border: 2px dashed #dee2e6 !important; }
    .upload-zone { transition: all 0.2s ease; }
    .upload-zone:hover { border-color: #0d6efd !important; background: #f0f7ff !important; }
    .cursor-pointer { cursor: pointer; }
    .bg-light-primary { background: rgba(13, 110, 253, 0.05); }

    .search-trigger-btn {
      width: 45px;
      height: 45px;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
      position: relative;
      background: #ffffff;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .search-trigger-btn:hover {
      transform: scale(1.1);
      box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.15) !important;
    }
    
    .search-bar-slider {
      position: absolute;
      right: 22px; /* starts behind the trigger button */
      width: 0px;
      opacity: 0;
      visibility: hidden;
      transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); /* Bouncy elegant transition */
      height: 45px;
    }
    .search-bar-slider.open {
      width: 350px; /* slides out much further to the left */
      opacity: 1;
      visibility: visible;
      right: 55px; /* pop out to the left of the expanded button */
    }
    .search-input-pill {
      border-radius: 50px;
      overflow: hidden;
      border: 1px solid #e0e0e0;
      background: white;
      box-shadow: 0 4px 6px rgba(0,0,0,0.05);
    }
  `]
})
export class PostPropertyComponent {
  propertyForm: FormGroup;
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
  
  images: File[] = [];
  previews: { url: string, isValid: boolean }[] = [];
  
  loading = false;
  locating = false;
  geoLoading = false;
  isSearchingLocation = false;
  showSearchMap = false;
  geoDetected = '';
  error = '';
  mapInstance!: Map;
  markerInstance!: Marker;

  constructor(
    private fb: FormBuilder,
    private propertyService: PropertyService,
    private router: Router,
    private toast: ToastService
  ) {
    this.propertyForm = this.fb.group({
      type: ['sale', Validators.required],
      propertyType: ['Flat', Validators.required],
      title: ['', Validators.required],
      description: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(1)]],
      area: ['', [Validators.required, Validators.min(1)]],
      bedrooms: ['', Validators.required],
      bathrooms: ['', Validators.required],
      furnishing: ['Unfurnished'],
      state: ['', Validators.required],
      location: ['', Validators.required],
      town: [''],
      village: [''],
      address: ['', Validators.required],
      lat: ['', Validators.required],
      lng: ['', Validators.required]
    });

    this.propertyForm.get('propertyType')?.valueChanges.subscribe(val => {
      const isRoomType = ['Flat', 'Row House', 'Bungalow', 'Penthouse'].includes(val);
      if (isRoomType) {
        this.propertyForm.get('bedrooms')?.setValidators([Validators.required]);
        this.propertyForm.get('bathrooms')?.setValidators([Validators.required]);
      } else {
        this.propertyForm.get('bedrooms')?.clearValidators();
        this.propertyForm.get('bathrooms')?.clearValidators();
      }
      this.propertyForm.get('bedrooms')?.updateValueAndValidity();
      this.propertyForm.get('bathrooms')?.updateValueAndValidity();
    });
  }

  ngOnInit() {
    setTimeout(() => this.initMap(), 500);
  }

  private initMap() {
    const defaultLat = 20.5937; // Center of India
    const defaultLng = 78.9629;

    this.mapInstance = new Map('postMap').setView([defaultLat, defaultLng], 5);
    // Use Google Hybrid/Satellite maps for better building visibility
    tileLayer('https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      attribution: '&copy; Google Maps'
    }).addTo(this.mapInstance);

    this.markerInstance = marker([defaultLat, defaultLng], {
      icon: icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41]
      }),
      draggable: true
    }).addTo(this.mapInstance);

    this.markerInstance.on('dragend', () => {
      const pos = this.markerInstance.getLatLng();
      this.updateCoords(pos.lat, pos.lng);
    });

    this.mapInstance.on('click', (e: any) => {
      const pos = e.latlng;
      this.markerInstance.setLatLng(pos);
      this.updateCoords(pos.lat, pos.lng);
    });
  }

  getCurrentLocation() {
    if (!navigator.geolocation) {
      this.toast.error('Geolocation is not supported by your browser');
      return;
    }

    this.locating = true;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        this.updateCoords(latitude, longitude);
        this.mapInstance.setView([latitude, longitude], 19);
        this.markerInstance.setLatLng([latitude, longitude]);
        this.locating = false;
      },
      (err) => {
        this.toast.error('Could not get your location. Please check permissions.');
        this.locating = false;
      }
    );
  }

  searchMapLocation(query: string) {
    if (!query || query.trim() === '') return;
    this.isSearchingLocation = true;
    
    // Nominatim geocoding API to search via text
    fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`)
      .then(res => res.json())
      .then(data => {
        this.isSearchingLocation = false;
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);
          
          this.mapInstance.setView([lat, lng], 13);
          this.markerInstance.setLatLng([lat, lng]);
          this.updateCoords(lat, lng);
        } else {
          this.toast.warning('Location not found. Please try a more specific search term.');
        }
      })
      .catch(err => {
        this.isSearchingLocation = false;
        this.toast.error('Error searching for location. Please try again.');
      });
  }

  private updateCoords(lat: number, lng: number) {
    this.propertyForm.patchValue({ lat, lng });
    this.reverseGeocode(lat, lng);
  }

  private reverseGeocode(lat: number, lng: number) {
    this.geoLoading = true;
    this.geoDetected = '';
    fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`)
      .then(res => res.json())
      .then(data => {
        this.geoLoading = false;
        
        const stateName = data.principalSubdivision || '';
        let village = data.locality || '';
        let town = data.city || '';
        let district = '';

        if (data.localityInfo?.administrative) {
          const admin = data.localityInfo.administrative;
          // Find district (adminLevel 5)
          const distObj = admin.find((a: any) => a.adminLevel === 5);
          if (distObj) district = distObj.name.replace(' district', '').trim();
          
          // Find town/taluka (adminLevel 6) if not already found
          if (!town) {
             const townObj = admin.find((a: any) => a.adminLevel === 6);
             if (townObj) town = townObj.name.replace(' Taluka', '').trim();
          }
        }

        const patch: any = {};
        // Fill base variables
        if (village) patch.village = village;
        if (town) patch.town = town;

        if (stateName) {
          // Normalize and match state
          const matchedState = this.states.find(s => 
            s.toLowerCase() === stateName.toLowerCase() ||
            stateName.toLowerCase().includes(s.toLowerCase().replace(' (nct)', '').replace(/\s*\(.*\)/, ''))
          );

          if (matchedState) {
            patch.state = matchedState;
            this.selectedState = matchedState;
            this.filteredCities = [...this.statesData[matchedState], 'Others'];

            // Match City to District or let it fall back
            let matchedCity = this.statesData[matchedState].find(c => 
               (district && c.toLowerCase() === district.toLowerCase()) || 
               (town && c.toLowerCase() === town.toLowerCase()) ||
               (data.city && c.toLowerCase() === data.city.toLowerCase())
            );

            if (matchedCity) {
               patch.location = matchedCity;
            } else {
               const customCity = district || town || data.city;
               if (customCity) {
                 this.filteredCities.unshift(customCity); // Ensure it's selectable in the UI
                 patch.location = customCity;
               }
            }
          }
        }

        this.propertyForm.patchValue(patch);

        // Build detected summary text for UI
        const parts = [patch.village, patch.town, patch.location, patch.state].filter(Boolean);
        this.geoDetected = parts.join(', ');
      })
      .catch(() => {
        this.geoLoading = false;
      });
  }

  onStateChange() {
    this.selectedState = this.propertyForm.get('state')?.value;
    if (this.selectedState) {
      this.filteredCities = [...this.statesData[this.selectedState], 'Others'];
      this.propertyForm.patchValue({ location: '' });
    } else {
      this.filteredCities = [];
    }
  }

  showRooms() {
    const pt = this.propertyForm.get('propertyType')?.value;
    return ['Flat', 'Row House', 'Bungalow', 'Penthouse'].includes(pt);
  }

  onFileChange(event: any) {
    const files = event.target.files;
    if (files) {
      if (this.images.length + files.length > 30) {
        this.error = 'Maximum 30 images allowed';
        return;
      }
      
      this.error = '';
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const isValid = file.size <= 5 * 1024 * 1024; // 5MB limit
        
        this.images.push(file);
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.previews.push({ url: e.target.result, isValid });
          if (!isValid) {
            this.error = 'Some images are too large (Max 5MB) and highlighted in red. Please remove them to proceed.';
          }
        };
        reader.readAsDataURL(file);
      }
    }
  }

  removeImage(index: number) {
    this.images.splice(index, 1);
    this.previews.splice(index, 1);
    
    if (!this.hasInvalidImages()) {
      this.error = '';
    }
  }

  hasInvalidImages(): boolean {
    return this.previews.some(p => !p.isValid);
  }

  onSubmit() {
    if (this.propertyForm.invalid) {
      this.propertyForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const formData = new FormData();
    
    // Append all form fields
    Object.keys(this.propertyForm.value).forEach(key => {
      let val = this.propertyForm.value[key];
      if (typeof val === 'string') val = val.trim();
      if (val !== null && val !== '') {
        formData.append(key, val);
      }
    });

    // Append images
    for (let i = 0; i < this.images.length; i++) {
      formData.append('images', this.images[i]);
    }

    this.propertyService.createProperty(formData).subscribe({
      next: (res) => {
        this.loading = false;
        this.toast.success('Property posted successfully!');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || err.error?.error || 'Error posting property. Please check if all images are valid.';
        console.error(err);
      }
    });
  }
}
