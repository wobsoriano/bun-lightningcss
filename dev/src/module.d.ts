declare module "*.module.css" {
  const content: {
    readonly [key: string]: string;
  };
  export default content;
}
