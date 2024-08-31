import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Game } from '../models/game';
import { PlayerComponent } from "../player/player.component";
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DialogAddPlayerComponent } from '../dialog-add-player/dialog-add-player.component';
import { GameInfoComponent } from "../game-info/game-info.component";
import { Firestore, collection, doc, docData, collectionData, CollectionReference, DocumentData, setDoc, DocumentReference } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, PlayerComponent, MatButtonModule, MatIconModule, MatDialogModule, GameInfoComponent],
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent {
  game: Game = { 
    players: [],
    stack: [], 
    playedCards: [], 
    currentPlayer: 0, 
    pickCardAnimation: false, 
    currentCard: ''
  };

  gameId: string = '';

  gamesCollection: CollectionReference<DocumentData>;
  games$: Observable<any[]>;

  constructor(private route: ActivatedRoute, private firestore: Firestore, public dialog: MatDialog) {
    this.gamesCollection = collection(this.firestore, 'games');
    this.games$ = collectionData(this.gamesCollection);
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.gameId = params['id'];

      const gameDocRef = doc(this.firestore, `games/${this.gameId}`);
      docData(gameDocRef).subscribe((data) => {
        const game = data as Game;
        if (game) {
          this.game = game;
        }
      });
    });
  }

  newGame() {
    this.game = new Game();
  }

  takeCard() {
    if (this.game.pickCardAnimation) return;
    this.game.currentCard = this.game.stack.pop();
    this.game.pickCardAnimation = true;

    this.game.currentPlayer++;
    this.game.currentPlayer = this.game.currentPlayer % this.game.players.length;

    setTimeout(() => {
      this.game.playedCards.push(this.game.currentCard!);
      this.game.pickCardAnimation = false;
    }, 1500);

    this.saveGame();
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(DialogAddPlayerComponent);

    dialogRef.afterClosed().subscribe((name: string) => {
      if (!name) return;
      this.game.players.push(name);
      this.saveGame();
    });
  }

  saveGame() {
    const gameDocRef: DocumentReference<DocumentData> = doc(this.firestore, `games/${this.gameId}`);
    setDoc(gameDocRef, { ...this.game }).then(() => {
      console.log('Game saved successfully');
    }).catch((error) => {
      console.error('Error saving game: ', error);
    });
  }
}
