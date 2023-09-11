import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Country, Region, SmallCountry } from '../interfaces/country.interface';
import { Observable, combineLatest, map, of, tap } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class CountriesService {

  private _regions: Region[] = [ Region.Africa, Region.Americas, Region.Asia, Region.Europe, Region.Oceania ];

  private baseUrl: string = "https://restcountries.com/v3.1";

  constructor( private http: HttpClient ) { }

  get regions(): Region[] {

    return [...this._regions];
  }

  getCountriesByRegion( region: Region ): Observable<SmallCountry[]> {

    if( !region ) return of([]);

    const url: string = `${ this.baseUrl }/region/${ region }?fields=name,cca3,borders`;

    return this.http.get<Country[]>( url ).pipe(
      map( countries => countries.map( country => ({
        name: country.name.common,
        cca3: country.cca3,
        borders: country.borders ?? []// operador de covalencia nula
      })))
    );
  }

  getCountryByAlphaCode( cca3: string ): Observable<SmallCountry> {

    const url:string = `${ this.baseUrl }/alpha/${ cca3 }?fields=name,cca3,borders`;

    return this.http.get<Country>( url ).pipe(
      // tap(value => console.log(value)),
      map( country => ({
        name: country.name.common,
        cca3: country.cca3,
        borders: country.borders ?? []
      }))
    );
  }

  getCountryBordersByCodes( borders: string[] ): Observable<SmallCountry[]> {

    if (!borders || borders.length === 0) return of([]);

    const countryRequests: Observable<SmallCountry>[] = [];

    borders.forEach( code => {

      const request = this.getCountryByAlphaCode( code );
      countryRequests.push( request );
    });

    return combineLatest( countryRequests );
  }


}

