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

  // Add attributes directly to the node (prefixed with @)
  for (NSString *key in attributeDict) {
    node[[@"@" stringByAppendingString:key]] = attributeDict[key];
  }

  [self.stack addObject:@{@"name": elementName, @"node": node}];
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
  NSString *currentName = self.stack.lastObject[@"name"];

  [self.stack removeLastObject];

  // Determine the value for this element
  id value;
  if (current.count == 0 && trimmed.length > 0) {
    // No children or attributes, just text - use the text directly
    value = trimmed;
  } else if (current.count == 0 && trimmed.length == 0) {
    // Empty element
    value = @"";
  } else {
    // Has children or attributes
    if (trimmed.length > 0) {
      current[@"#text"] = trimmed;
    }
    value = current;
  }

  if (self.stack.count > 0) {
    // Add to parent
    NSMutableDictionary *parent = self.stack.lastObject[@"node"];

    if (parent[currentName]) {
      // Key already exists - convert to array or append
      id existing = parent[currentName];
      if ([existing isKindOfClass:[NSMutableArray class]]) {
        [existing addObject:value];
      } else {
        parent[currentName] = [NSMutableArray arrayWithObjects:existing, value, nil];
      }
    } else {
      parent[currentName] = value;
    }
  } else {
    // Root element
    [self.stack addObject:@{currentName: value}];
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
