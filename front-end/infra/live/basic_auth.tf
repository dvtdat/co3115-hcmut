locals {
  basic_auth_enabled      = var.basic_auth_secret_arn != null
  basic_auth_function_arn = local.basic_auth_enabled ? aws_cloudfront_function.basic_auth[0].arn : null
}

# Only created on dev and staging — count = 0 skips evaluation entirely on prod.
data "aws_secretsmanager_secret_version" "basic_auth" {
  count     = local.basic_auth_enabled ? 1 : 0
  secret_id = var.basic_auth_secret_arn
}

resource "aws_cloudfront_function" "basic_auth" {
  count   = local.basic_auth_enabled ? 1 : 0
  name    = "tolerant-${var.env_name}-basic-auth"
  runtime = "cloudfront-js-2.0"
  publish = true
  code = templatefile("${path.module}/function.js.tpl", {
    credentials_base64 = base64encode("${jsondecode(data.aws_secretsmanager_secret_version.basic_auth[0].secret_string).username}:${jsondecode(data.aws_secretsmanager_secret_version.basic_auth[0].secret_string).password}")
    env_name           = var.env_name
  })
}
