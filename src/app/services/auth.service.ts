import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppState } from '../app.reducer';
import * as authActions from '../auth/auth.action';

import { Usuario } from '../models/usuario.model';
import * as ingresoEgresoActions from '../ingreso-egreso/ingreso-egreso.actions';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  userSubscription: Subscription | undefined;
  private _user!: Usuario | null;

  get user(){
    return this._user;
  }

  constructor(
    public auth: AngularFireAuth,
    public firestore: AngularFirestore,
    private store: Store<AppState>
  ) { }

  initAuthListener(){
    this.auth.authState.subscribe( fuser => {
      // console.log(fuser?.uid);
      if( fuser ){
        this.userSubscription = this.firestore.doc(`${ fuser.uid }/usuario`).valueChanges()
            .subscribe( (firestoreUser: any) => {
              const user = Usuario.fromFirebase( firestoreUser );
              this._user = user;
              this.store.dispatch( authActions.setUser({ user }) );
            })
      }else{
        this._user = null;
        this.userSubscription?.unsubscribe();
        this.store.dispatch( authActions.unsetUser() );
        this.store.dispatch( ingresoEgresoActions.unsetItems() )
      }
    })
  }

  crearUsuario( nombre: string, email: string, password: string){
    return this.auth.createUserWithEmailAndPassword( email, password )
              .then( fbUser => {
                const newUser = new Usuario( fbUser.user?.uid, nombre, email );
                return this.firestore.doc(`${ fbUser.user?.uid }/usuario`).set({...newUser})
              });
  }

  loginUsuario( email: string, password: string){
    return this.auth.signInWithEmailAndPassword( email, password );
  }

  logout(){
    return this.auth.signOut();
  }

  isAuth(){
    return this.auth.authState.pipe(
      map( fbUser => fbUser != null )
    );
  }

}
