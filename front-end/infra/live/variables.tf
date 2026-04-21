variable "env_name" {
  type = string
}

variable "bucket_name" {
  type = string
}

variable "basic_auth_secret_arn" {
  type        = string
  default     = null
  description = "ARN of Secrets Manager secret for Basic Auth. Null disables Basic Auth (prod)."
}

variable "aws_region" {
  type        = string
  description = "AWS region"
}
