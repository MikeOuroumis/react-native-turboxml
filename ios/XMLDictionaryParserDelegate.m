#import "XMLDictionaryParserDelegate.h"

@interface XMLDictionaryParserDelegate ()

@property (nonatomic, strong) NSMutableArray *stack;
@property (nonatomic, strong) NSMutableString *text;

@end

@implementation XMLDictionaryParserDelegate

- (instancetype)init {
  self = [super init];
  if (self) {
    _stack = [NSMutableArray array];
    _text = [NSMutableString string];
  }
  return self;
}

- (void)parserDidStartDocument:(NSXMLParser *)parser {
  [self.stack removeAllObjects];
  [self.text setString:@""];
}

- (void)parser:(NSXMLParser *)parser didStartElement:(NSString *)elementName
   namespaceURI:(NSString *)namespaceURI qualifiedName:(NSString *)qName
    attributes:(NSDictionary<NSString *, NSString *> *)attributeDict
{
  NSMutableDictionary *node = [NSMutableDictionary dictionary];
  if (attributeDict.count > 0) {
    node[@"_attributes"] = attributeDict;
  }

  [self.stack addObject:@{@"name": elementName, @"node": node, @"children": [NSMutableArray array]}];
  [self.text setString:@""];
}

- (void)parser:(NSXMLParser *)parser foundCharacters:(NSString *)string {
  [self.text appendString:string];
}

- (void)parser:(NSXMLParser *)parser didEndElement:(NSString *)elementName
 namespaceURI:(NSString *)namespaceURI qualifiedName:(NSString *)qName
{
  NSString *trimmed = [self.text stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]];
  NSMutableDictionary *current = [self.stack.lastObject[@"node"] mutableCopy];

  if (trimmed.length > 0) {
    current[@"_text"] = trimmed;
  }

  NSArray *children = self.stack.lastObject[@"children"];
  if (children.count > 0) {
    current[@"_children"] = children;
  }

  NSDictionary *finished = @{ self.stack.lastObject[@"name"]: current };
  [self.stack removeLastObject];

  if (self.stack.count > 0) {
    NSMutableArray *parentChildren = self.stack.lastObject[@"children"];
    [parentChildren addObject:finished];
  } else {
    [self.stack addObject:finished]; // final result
  }

  [self.text setString:@""];
}

- (NSDictionary *)result {
  if (self.stack.count > 0 && [self.stack.firstObject isKindOfClass:[NSDictionary class]]) {
    return self.stack.firstObject;
  }
  return @{};
}

@end
