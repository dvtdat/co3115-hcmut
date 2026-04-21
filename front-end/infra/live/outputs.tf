output "cloudfront_url" {
  value       = "https://${aws_cloudfront_distribution.frontend.domain_name}"
  description = "Environment HTTPS URL"
}

output "cloudfront_distribution_id" {
  value       = aws_cloudfront_distribution.frontend.id
  description = "Used in GitHub Actions secret CLOUDFRONT_DISTRIBUTION_ID"
}

output "s3_bucket_name" {
  value = aws_s3_bucket.frontend.id
}
