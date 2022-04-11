export class DecoratorHelper {
  constructor(
    public name: string,
    public importFrom: string,
    public options: object = {},
  ) {}

  public generateContent() {
    return `@${this.name}(${this.generateOptionsObjectString()})`;
  }

  private convertOptionsToArray(): string[] {
    const result: string[] = [];

    for (const [key, value] of Object.entries(this.options)) {
      result.push(`${key}: ${value}`);
    }

    return result;
  }

  private generateOptionsObjectString(): string {
    let result = '';
    let optionsArray = this.convertOptionsToArray();

    if (optionsArray.length === 0) {
      return result;
    }

    result = optionsArray.join(', ');
    result = `{${result}}`;

    return result;
  }
}
