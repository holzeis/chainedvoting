import { ChainedVotingPage } from './app.po';

describe('chained-voting App', function() {
  let page: ChainedVotingPage;

  beforeEach(() => {
    page = new ChainedVotingPage();
  });

  it('should display message saying hello blockchain taskforce', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Hello Blockchain Taskforce!');
  });
});
