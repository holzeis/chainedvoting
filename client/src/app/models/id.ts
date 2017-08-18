export class ID {
    public id: string;

    constructor() {
        this.id = Math.random().toString(36).substr(2, 9);
    }
}
