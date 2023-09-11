import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { CountriesService } from '../../services/countries.service';
import { Country, Region, SmallCountry } from '../../interfaces/country.interface';
import { filter, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-selector-page',
  templateUrl: './selector-page.component.html',
  styles: [
  ]
})
export class SelectorPageComponent implements OnInit{

  public myForm: FormGroup = this.fb.group({

    region: ["", Validators.required],
    country: ["", Validators.required],
    border: ["", Validators.required]
  });

  // public regions = this.countriesService.regions; mejor hacerlo como getter

  public countriesByRegion: SmallCountry[] = [];

  public borders: SmallCountry[] = [];

  constructor(
    private fb: FormBuilder,
    private countriesService: CountriesService
  ) {}

  ngOnInit(): void {
    this.onRegionChanged();
    this.onCountryChanged();
  }

  get regions(): Region[] {

    return this.countriesService.regions;
  }

  onRegionChanged(): void {

    this.myForm.get("region")?.valueChanges
    .pipe(
      tap( () => this.myForm.get("country")!.setValue( "" ) ),
      switchMap( value => this.countriesService.getCountriesByRegion( value ) )
    )
    .subscribe(
      countries => this.countriesByRegion = countries
    );
  }

  onCountryChanged():void {

    this.myForm.get( "country" )!.valueChanges
      .pipe(
        tap( () => this.myForm.get("border")!.setValue( "" ) ),
        // tap( () => this.borders = [] ),
        filter( ( value: string ) => value.length > 0 ),
        switchMap( value => this.countriesService.getCountryByAlphaCode( value ) ),
        switchMap( country => this.countriesService.getCountryBordersByCodes( country.borders ))
      )
      .subscribe(
        countries => {this.borders = countries;
         console.log({borders: this.borders })}
      );
    }

}
