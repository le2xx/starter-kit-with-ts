const readline = require('readline');
const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'src/app/components');
const inTerm = process.argv[2];
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
const messages = {
  enterName: {
    text: 'Enter new component name: ',
    color: null
  },
  ok: {
    text: 'OK >>> The component is created with the name: ',
    color: '\x1b[32m%s\x1b[0m'
  },
  error: {
    text: 'ERROR >>> Component with the same name already created, enter another name: ',
    color: '\x1b[31m%s\x1b[0m'
  }
};

class Templates {
  private name: string;

  constructor(name: string) {
    this.name = name;
  }

  static camelCaseNameFunc(name: string): string {
    const lenName = name.split('-').length;
    if (lenName > 1) {
      return name.split('-')
        .map((item, index) =>
          index === 0 ? item : item.charAt(0).toUpperCase() + item.substr(1))
        .join('');
    }
    return name;
  }

  get pug(): string {
    return `mixin ${this.name}()\r\n\t`+
      `.${this.name}\r\n`;
  }

  get scss(): string {
    return `.${this.name} {\r\n\t`+
      `display block\r\n` + '}';
  }

  get ts(): string {
    return `const ${Templates.camelCaseNameFunc(this.name)} = () => {\r\n\t`+
      `console.log('${Templates.camelCaseNameFunc(this.name)}');\r\n`+
      `};\r\n`+
      `export { ${Templates.camelCaseNameFunc(this.name)} };\r\n`;
  }
}

const checkName = name => {
  return !fs.readdirSync(componentsDir)
    .map(item => item.toLowerCase())
    .some(item => item === name.toLowerCase());
};

const createFilesComponent = name => {
  const nameTransformed = name.toLowerCase();
  const newPath = componentsDir + '/' + nameTransformed;
  const pugFileName = nameTransformed + '.pug';
  const scssFileName = nameTransformed + '.scss';
  const tsFileName = nameTransformed + '.ts';
  const template = new Templates(nameTransformed);

  fs.mkdirSync(newPath);

  fs.writeFileSync(`${newPath}/${pugFileName}`, template.pug);
  console.log('\x1b[32m%s\x1b[0m', `FILE CREATED >>> ${pugFileName}`);

  fs.writeFileSync(`${newPath}/${scssFileName}`, template.scss);
  console.log('\x1b[32m%s\x1b[0m', `FILE CREATED >>> ${scssFileName}`);

  fs.writeFileSync(`${newPath}/${tsFileName}`, template.ts);
  console.log('\x1b[32m%s\x1b[0m', `FILE CREATED >>> ${tsFileName}`);
};

const createNewComponent = name => {
  if (checkName(name)) {
    createFilesComponent(name);
    return true;
  }
  return false;
};

if (inTerm) {
  rl.close();
  createNewComponent(inTerm);
  console.log(messages.ok.color, messages.ok.text + inTerm.toLowerCase());
  process.exit(0);
}

rl.question(messages.enterName.text, (answer) => {
  if (createNewComponent(answer)) {
    console.log(messages.ok.color, messages.ok.text + answer.toLowerCase());
    rl.close();
    process.exit(0);
  }
  console.log(messages.error.color, messages.error.text + answer.toLowerCase());
  rl.close();
  process.exit(0);
});
