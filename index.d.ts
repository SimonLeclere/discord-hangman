import { Message, TextChannel, User } from 'discord.js';
import Hangman from './hangman';

type GameStatus = 'in progress' | 'won' | 'lost';

interface GameResult {
    game?: Hangman;
    selector?: User;
}

interface GameInfo {
    status: GameStatus;
    progress: string;
    misses: string[];
    lifes: number;
}

interface HangmanMessages {
    createNoPlayers: string;
    
    customNotEnoughPlayers: string;
    customInitMessage: string;
    customNoMoreWords: string;

    gatherPlayersMsg: string;

    getWordFromPlayersDm: string;
    timesUpDm: string;
    timesUpMsg: string;
    wordSuccess: string;
    invalidWord: string;
    tooManyInvalidsWords: string;

    misses: string;
    won: string;
    gameOver: string;
    gameOverMsg: string;
}

interface HangmanOptions {
    word?: string;
    messages?: HangmanMessages;
    displayWordOnGameOver?: boolean;
    players?: User[];
    filter?: function;
}

class Hangman {
    public word: string;
    public lives: number;
    public progress: string;
    public remaining: number;
    public misses: string[];
    public status: GameStatus;
    public gameOver: boolean;
    public message: Message | null;

    public constructor(
        word?: string, 
        public channel: TextChannel, 
        public players: User[], 
        public messages: HangmanMessages, 
        public displayWordOnGameOver: boolean
    );

    public static hyphenString(n: number): string;
    
    public replaceChar(char: string): void;

    public async showProgress(): Promise<void>;

    public getFigure(): string;

    public guess(c: string): GameInfo;

    public guessAll(word: string): boolean;

    public async start(): Promise<void>;
}

export default class HangmansManager {
    public async create(
        channel: TextChannel, 
        gameType: 'random' | 'custom', 
        options?: HangmanOptions
    ): Promise<GameResult>

    private getPlayersFromMessage(
        channel: TextChannel
    ): Promise<User[]>

    private async gatherPlayersFromReaction(
        message: Message, 
        emoji: string
    ): Promise<User[]>

    private async gatherPlayers(
        channel: TextChannel, 
        messages: HangmanMessages
    ): Promise<User[]>

    private async getWordFromPlayers(
        players: User[], 
        channel: TextChannel, 
        messages: HangmanMessages
    ): void | GameResult;
}
