import { Component } from '@angular/core';
import { Firestore, collection, addDoc, CollectionReference, DocumentData, DocumentReference } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Game } from '../models/game';

@Component({
  selector: 'app-startscreen',
  standalone: true,
  imports: [],
  templateUrl: './startscreen.component.html',
  styleUrls: ['./startscreen.component.scss']
})
export class StartscreenComponent {
  gamesCollection: CollectionReference<DocumentData>;
  game: Game;

  constructor(private firestore: Firestore, private router: Router) {
    this.gamesCollection = collection(this.firestore, 'games');
    this.game = new Game();
  }

  newGame() {
    this.game = new Game();
    addDoc(this.gamesCollection, { ...this.game }).then((docRef: DocumentReference<DocumentData>) => {
      console.log('Game added successfully', this.game);
      this.router.navigateByUrl(`/game/${docRef.id}`);
    }).catch((error) => {
      console.error('Error adding game: ', error);
    });
  }
}
