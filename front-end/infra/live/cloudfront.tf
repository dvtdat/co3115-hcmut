resource "aws_cloudfront_origin_access_control" "frontend" {
  name                              = "tolerant-${var.env_name}-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "frontend" {
  enabled             = true
  default_root_object = "index.html"
  comment             = "Tolerant FE - ${var.env_name}"
  price_class         = "PriceClass_100"

  origin {
    domain_name              = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id                = "s3-${aws_s3_bucket.frontend.id}"
    origin_access_control_id = aws_cloudfront_origin_access_control.frontend.id
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "s3-${aws_s3_bucket.frontend.id}"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    # AWS Managed cache policy: CachingOptimized (ID is fixed across all accounts)
    cache_policy_id = "658327ea-f89d-4fab-a63d-7e88639e58f6"

    dynamic "function_association" {
      for_each = local.basic_auth_function_arn != null ? [local.basic_auth_function_arn] : []
      content {
        event_type   = "viewer-request"
        function_arn = function_association.value
      }
    }
  }

  # SPA routing: S3 returns 404 (key not found) or 403 (OAC key not found) for unknown
  # React Router paths. Return index.html with 200 so the client-side router handles it.
  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 10
  }

  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 10
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}
