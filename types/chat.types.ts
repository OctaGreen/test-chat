export interface Message {
  id: number;
  uuid: number;
  name: string;
  color: string;
  text: string;
  created: number;
};

export interface Chat {
  messages: Message[];
}