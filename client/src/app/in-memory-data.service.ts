import { InMemoryDbService } from 'angular-in-memory-web-api';
export class InMemoryDataService implements InMemoryDbService {
  createDb() {
    const polls = [
      {
        id: '1234',
        name: 'Class president',
        description: 'Class president poll of 2017',
        owner: 'Mr. Bert',
        validFrom: 'tba',
        validTo: '',
        options: [
          'Tom', 'Jerry'
        ],
        votes: []
      },
      {
        id: '1235',
        name: 'Class vice president',
        description: 'Class vice president poll of 2017',
        owner: 'Mr. Bert',
        validFrom: 'tba',
        validTo: '',
        options: [
          'Tom', 'Jerry'
        ],
        votes: []
      }
    ];
    return {polls};
  }
}