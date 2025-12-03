#import "Turboxml.h"
#import "XMLDictionaryParserDelegate.h"

@implementation Turboxml
RCT_EXPORT_MODULE()

- (void)parseXml:(NSString *)xml
         resolve:(RCTPromiseResolveBlock)resolve
          reject:(RCTPromiseRejectBlock)reject
{
  dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
    @try {
      NSData *data = [xml dataUsingEncoding:NSUTF8StringEncoding];
      if (!data) {
        dispatch_async(dispatch_get_main_queue(), ^{
          reject(@"PARSE_ERROR", @"Failed to encode XML string", nil);
        });
        return;
      }

      NSXMLParser *parser = [[NSXMLParser alloc] initWithData:data];
      XMLDictionaryParserDelegate *delegate = [[XMLDictionaryParserDelegate alloc] init];
      parser.delegate = delegate;

      BOOL success = [parser parse];

      dispatch_async(dispatch_get_main_queue(), ^{
        if (success) {
          NSDictionary *result = [delegate result];
          resolve(result ?: @{});
        } else {
          NSError *error = [parser parserError];
          reject(@"PARSE_ERROR",
                 error.localizedDescription ?: @"Unknown XML parsing error",
                 error);
        }
      });
    } @catch (NSException *exception) {
      dispatch_async(dispatch_get_main_queue(), ^{
        reject(@"PARSE_ERROR", exception.reason ?: @"Unknown error", nil);
      });
    }
  });
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeTurboxmlSpecJSI>(params);
}

@end
