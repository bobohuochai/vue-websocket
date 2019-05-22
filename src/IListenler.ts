export default interface IListenler {
  register(): void;
  onEvent(...args: any[]): void;
}
