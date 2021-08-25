public with sharing class FunctionController {
  @AuraEnabled
  public static String invoke(String functionName, String payload) {
    functions.Function function = functions.Function.get(functionName);

    functions.FunctionInvocation invocation = function.invoke(payload);

    if (invocation.getStatus() == functions.FunctionInvocationStatus.ERROR) {
      throw new CalloutException(
        (invocation.getError() != null
          ? invocation.getError().getMessage()
          : 'UNKNOWN')
      );
    }

    String response = invocation.getResponse();
    return response;
  }
}
