export class BlizzardApiError extends Error {
  constructor(public override message: string, public status = 500) {
    super(message);
    this.name = "BlizzardApiError";
  }
}