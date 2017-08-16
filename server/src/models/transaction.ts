export class Transaction {
  number: number;
  blockhash: string;
  txId: string;
  timestamp: Date;
  channel: string;
  type: string;

  constructor(_number: number, _hash: string, header: any) {
    this.number = _number;
    this.blockhash = _hash.substring(0, 20);

    this.channel = header.channel_id;
    this.timestamp = header.timestamp;
    this.txId = header.tx_id.substring(0, 20);
    this.type = header.type;
  }
}
