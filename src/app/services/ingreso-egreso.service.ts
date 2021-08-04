import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { map } from 'rxjs/operators';
import { IngresoEgreso } from '../models/ingreso-egreso.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class IngresoEgresoService {

  constructor(
    private firestore: AngularFirestore,
    private authService: AuthService
  ) { }

  crearIngresoEgreso( ingresoEgreso: IngresoEgreso ){
    return this.firestore.doc(`${ this.authService.user?.uid }/ingresos-egresos`)
        .collection('items')
        .add( {...ingresoEgreso} );
  }

  initEgresosEgresosListener( uid: string | undefined ) {
    return this.firestore.collection(`${ uid }/ingresos-egresos/items`)
        .snapshotChanges()
        .pipe(
          // multiple linea
          // map( snapshot => {
          //   return snapshot.map( doc => {
          //     return {
          //       uid: doc.payload.doc.id,
          //       ...doc.payload.doc.data() as any
          //     }
          //   });
          // })

          // una sola linea
          map( snapshot => snapshot.map( doc => ({ uid: doc.payload.doc.id, ...doc.payload.doc.data() as any })))
        );
  }

  borrarIngresoEgreso( uidItem: string ) {
    return this.firestore.doc(`${ this.authService.user?.uid }/ingresos-egresos/items/${ uidItem }`)
        .delete();
  }

}
